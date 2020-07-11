import {Component, NgZone,Input, OnDestroy, OnInit, HostListener, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {faBell, faCog, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet, faAt} from '@fortawesome/free-solid-svg-icons';

import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
import { StellarService } from 'src/app/authorization/services/stellar-service'
import {SubSink} from 'subsink'
import { SwUpdate, SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
var StellarSdk = require('stellar-sdk');

import {PopupService} from 'src/app/shared/popup/popup.service';
import { SwUpdateNotifyService } from '../../sw-update-notifiy/sw-update-notify.service';

import { AlgoService } from 'src/app/system/algo.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { ReferralService } from 'src/app/referral/referral.service';
import { LogoutService } from '../../services/logout.service';
import { SnotifyService } from 'ng-snotify';
import { AdminService } from 'src/app/admin/admin.service';
import { LoadingService } from '../../services/loading.service';

// import { interval } from 'rxjs';
// import { timeoutWith } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy, OnInit {

  @Input() isGetAccountData: boolean;
  @Input() ComId: string;  
  @Input() adminPanel: boolean;

  isNavbarCollapsed = false;
  faPowerOff = faPowerOff;
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faChartLine = faChartLine;
  faAt = faAt;
  faCog = faCog;

  walletNotices: number = 0
  algoNotices: number = 0
  generalNotices: number = 0 
  subsink:SubSink
  server:any
  serverPayment: any
  // Indicate shown update new version to users
  // If already shown not show again.
  shownUpdate: boolean = false
  isSignout:boolean = false
  shouldReleadSub: Subscription

  //timeOutShowConfirmPwd:any;
  //timeOutLogout:any;
  currentURL:string = ''
   
  constructor(
    public authService: AuthService,
    public algoService: AlgoService,
    public noticeService: NoticeDataService,
    public stellarService: StellarService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone:NgZone,  
    public notificationsService: NotificationsService,
    public push: SwPush,
    public updates: SwUpdate,
    private http: HttpClient,
    public popupService: PopupService,   
    public swService: SwUpdateNotifyService, 
    private refService: ReferralService, 
    private logoutService: LogoutService,
    private snotifyService: SnotifyService,
    private adminService: AdminService,
    private loadingService: LoadingService,
  ) {   
    if (!this.adminService.adminSetting.loginStatus){      
      this.logoutService.signOut()  
      this.loadingService.show()        
    }  else {
      this.loadingService.hide()
    }  
    this.server = new StellarSdk.Server(environment.horizon_url);      
    this.authService.isGetBalance = false  
    //this.subsink = new SubSink()
    // get user meta data
    this.authService.GetLocalUserData()
    //console.log('NAV:userdata', this.authService.userData);

    this.authService.getUserMeta() 
    if (!this.authService.isSubUserMeta){            
      this.authService.subsink.add(this.authService.userMeta$.subscribe( data => {
        //console.log('NAV-userMeta$.subscribe:', data)
        if (data){
          this.authService.parseUserMeta(data)
        }
      }))
    }
        
    this.authService.streamPrices()
    if (!this.authService.isSubPrice){
      //console.log('NAV.sub price data')
      this.authService.subsink.add(this.authService.priceData$.subscribe( data => {
        //console.log('NAV-price data:', data)
        if (data){
          this.authService.parsePriceData(data)
        }    
      }))
    }
        
    // Get basic data    
    if (!this.authService.userInfo){
      this.http.post(`api/v1/users/getUserInfo`, {})
      .subscribe(res => {
        let data = (res as any)        
        if (data.errCode == environment.SUCCESS){           
          this.authService.ParseUserInfo(data)          
          this.authService.pushUserInfoMsg(this.authService.userInfo)
          this.authService.DecryptLocalSecret()                 
        } else {
          console.log('getUserInfo-userInfo failed') 
        }     
      },
      e => {//retry        
        console.log(e)
        this.http.post(`api/v1/users/getUserInfo`, {})
        .subscribe(res => {
          let data = (res as any)          
          if (data.errCode == environment.SUCCESS){            
            this.authService.ParseUserInfo(data)
            this.authService.pushUserInfoMsg(this.authService.userInfo)
            this.authService.DecryptLocalSecret()           
          } else {
            //this.errorService.handleError(null, `The request could not be performed! Please retry.`);
          }        
        }, e => {
          console.log(e)        
        })
      })
    } else {
      //this.streaming()  
    }    
    //this.subsink = new SubSink()     
  }

  ngOnInit(){
    
    // Add email for Intercom
    (<any>window).Intercom('boot', {
      app_id: "v9vzre42",    
      user_hash: this.authService.userData.Hmac,
      email: this.authService.userData.Email,
      name: this.authService.userData.Name,
    });
   
    if (this.authService.userMetaStore.XLM === 0){      
      this.authService.GetLocalUserMeta()      
    } 
    //console.log('navbar.subscribe', this.ComId)
    if (this.ComId != 'notification' && this.authService.userData.PublicKey){
      Promise.all([
        // this.stellarService.getCurrentGrxPrice1(),
        // this.stellarService.getCurrentXlmPrice1(),
        this.stellarService.getAccountBalance(this.authService.userData.PublicKey)
        .catch(err => {
          // Notify internet connection.
          //this.snotifyService.simple('Please check your internet connection.')
          console.log(err)
        })
      ])
      .then(([ balances ]) => {    
        if  (balances && (balances as any).grx && (balances as any).xlm){ 
          this.authService.userMetaStore.GRX = (balances as any).grx;
          this.authService.userMetaStore.XLM = (balances as any).xlm;
        }
        
        this.authService.isGetBalance = true
       
        
      }) 
    }  
    this.scheduleCheckTokenExpiry()
    this.logoutService.subsink.add(this.authService.subShouldReload().subscribe(data => {                
      this.scheduleCheckTokenExpiry()  
    }))
    this.currentURL = this.router.url    
  }

  scheduleCheckTokenExpiry(){ 
    //console.log('scheduleCheckTokenExpiry')
    if (this.authService.isTokenExpired()){
      //console.log('token is expired, signout')
      this.logoutService.signOut()
    } else {
      if (!this.authService.userMetaStore || !this.authService.userMetaStore.TokenExpiredTime || this.authService.userMetaStore.TokenExpiredTime==0){
        console.log('scheduleCheckTokenExpiry- user meta is null')
        return
      }
      let remainTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime()) - 15*60*1000
      //let remainTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime()) - 1*60*1000      
      if (remainTime >= 0){
        if (this.authService.timeOutShowConfirmPwd){
          clearTimeout(this.authService.timeOutShowConfirmPwd)
        }
        this.authService.timeOutShowConfirmPwd = setTimeout(()=> { 
          console.log('NAV.show confirm pwd')
          //setTimeout(() => { this.router.navigate([this.currentURL, {outlets: {popup: 'confirm-password'}}]); }, 0)             
            this.ngZone.run(()=> {
              this.router.navigate(['/settings/profile', {outlets: {popup: 'confirm-password'}}]);
              //this.router.navigate([this.currentURL, {outlets: {popup: 'confirm-password'}}]);                           
            })         
        }, remainTime)
      }

      // // Schedule to logout
      let logoutTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime() + 2)     
      if (logoutTime >= 0){
        if (this.authService.timeOutLogout){
          clearTimeout(this.authService.timeOutLogout)
        }
        this.authService.timeOutLogout = setTimeout(()=> {
          //will renew the token
          if (this.authService.isTokenExpired){
            console.log('NAV.token is expired, signout')
            this.logoutService.signOut()
          } else {
            this.scheduleCheckTokenExpiry()
          }          
        }, logoutTime)
      }
    }
  }

  @HostListener('window:beforeunload')
  ngOnDestroy():void {
    this.logoutService.subsink.unsubscribe()    
    if (!this.logoutService.isSignout){
      this.authService.SetLocalUserData()
      this.authService.SetLocalUserMeta()
    }
    clearTimeout(this.authService.timeOutShowConfirmPwd)
    clearTimeout(this.authService.timeOutLogout)
  }
  signOut(){
    this.logoutService.signOut()
  }

  // signOut(){  
  //   this.isSignout = true
  //   //console.log('NAV-signout')   
  //   this.logoutService.subsink.unsubscribe()
  //   this.authService.subsink.unsubscribe()
  //   this.authService.isSubPrice = false
  //   this.authService.isSubUserMeta = false

  //   if (this.authService.userMetaStore.OpenOrders > 0){
  //     this.authService.updateUserMeta()
  //   }
  //   clearTimeout(this.authService.timeOutShowConfirmPwd)
  //   clearTimeout(this.authService.timeOutLogout)
   
  //   this.algoService.resetServiceData()
  //   this.authService.resetServiceData()
  //   this.stellarService.resetServiceData()
  //   this.noticeService.resetServiceData()
  //   this.refService.resetData()
  //   localStorage.removeItem('grayll-user');    
  //   localStorage.removeItem('grayll-user-meta');   
  //   this.ngZone.run(() => {
  //     //console.log('signout-home')
  //     this.router.navigate(['']);      
  //   });
  // }
}
