import {Component, NgZone,Input, OnDestroy, OnInit, HostListener} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet, faAt} from '@fortawesome/free-solid-svg-icons';
import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
import { StellarService } from 'src/app/authorization/services/stellar-service'
import {SubSink} from 'subsink'
import { SwUpdate, SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { interval, Subject } from 'rxjs';
var StellarSdk = require('stellar-sdk');
import {SnotifyService} from 'ng-snotify';
import {PopupService} from 'src/app/shared/popup/popup.service';
import { SwUpdateNotifyService } from '../../sw-update-notifiy/sw-update-notify.service';
//import { AngularFireWrapper } from '../../services/angularfire.service';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/database';
import { AlgoService } from 'src/app/system/algo.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy, OnInit {

  @Input() isGetAccountData: boolean;
  @Input() ComId: string;  

  isNavbarCollapsed = false;
  faPowerOff = faPowerOff;
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faChartLine = faChartLine;
  faAt = faAt;
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
   
  constructor(
    public authService: AuthService,
    public algoService: AlgoService,
    public noticeService: NoticeDataService,
    public stellarService: StellarService,

    private router: Router,
    private ngZone:NgZone,
    public notificationsService: NotificationsService,
    public push: SwPush,
    public updates: SwUpdate,
    
    private http: HttpClient,
   // private snotifyService: SnotifyService,
    public popupService: PopupService,   
    public swService: SwUpdateNotifyService,
   
    //private afW: AngularFireWrapper,
    
  ) {
       
    this.server = new StellarSdk.Server(environment.horizon_url);      
    this.authService.isGetBalance = false  
    // get user meta data
    this.authService.getUserMeta()
        
    this.authService.streamPrices()
    if (this.authService.userMetaStore.TokenExpiredTime) {
      this.scheduleCheckTokenExpiry()
    } else {
      this.authService.userMeta.subscribe(data => {             
        this.scheduleCheckTokenExpiry()
      })
    }
    
    // Get basic data    
    if (!this.authService.userInfo){this.http.post(`api/v1/users/getUserInfo`, {})
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
            // streaming payment and trade
            //this.streaming() 
          } else {
            //this.errorService.handleError(null, `The request could not be performed! Please retry.`);
          }        
        },
        e => {
          console.log(e)        
        })
      })
    } else {
      //this.streaming()  
    } 
    
    this.subsink = new SubSink()     
  }

  ngOnInit(){
    if (!this.authService.userData){      
      this.authService.GetLocalUserData()
    } 
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
    if (this.ComId != 'notification'){
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
        console.log('NAV.totalGRX:', this.authService.userMetaStore.GRX)
        console.log('NAV.totalXLM:', this.authService.userMetaStore.XLM)
        
      }) 
    }    
  }

  scheduleCheckTokenExpiry(){ 
   console.log('scheduleCheckTokenExpiry')
    if (this.authService.isTokenExpired()){
      console.log('token is expired, signout')
      this.signOut()
    } else {
      if (!this.authService.userMetaStore || !this.authService.userMetaStore.TokenExpiredTime || this.authService.userMetaStore.TokenExpiredTime==0){
        return
      }
      let remainTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime()) - 15*60*1000
      //let remainTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime()) - 3*60*1000
      console.log('remaining time for renew token:', remainTime, this.authService.userMetaStore)
      if (remainTime >= 0){
        setTimeout(()=> {
          //will renew the token
          console.log('nav-scheduleCheckTokenExpiry-show confirm pwd:', this.router.url)
          if ( !this.router.url.includes('confirm-password') || !this.router.url.includes('login')){
            this.router.navigate([this.router.url, {outlets: {popup: 'confirm-password'}}]);
          } else {
            console.log('nav-scheduleCheckTokenExpiry')           
          }
        }, remainTime)
      }

      // // Schedule to logout
      let logoutTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime() + 2)
      //console.log('remaining time for logoutTime:', logoutTime, this.authService.userMetaStore.TokenExpiredTime)
      if (logoutTime >= 0){
        setTimeout(()=> {
          //will renew the token
          if (this.authService.isTokenExpired){
            console.log('token is expired')
            this.signOut()
          } else {
            //console.log('token already renew')
          }          
        }, logoutTime)
      }
    }
  }
  @HostListener('window:beforeunload')
  ngOnDestroy():void {
    this.subsink.unsubscribe()
    
    if (!this.isSignout){
      this.authService.SetLocalUserData()
      this.authService.SetLocalUserMeta()
    }
  }

  signOut(){  
    this.isSignout = true
    if (this.authService.subsink){
      this.authService.subsink.unsubscribe()
    }
    if (this.authService.userMetaStore.OpenOrders > 0){
      this.authService.updateUserMeta()
    }
    localStorage.removeItem('grayll-user');    
    localStorage.removeItem('grayll-user-meta');
    this.algoService.resetServiceData()
    this.authService.resetServiceData()
    this.stellarService.resetServiceData()
    this.noticeService.resetServiceData()
    
    //this.router.navigateByUrl('/', {skipLocationChange: false}).then(()=> this.router.navigate(['/']));    
    this.router.navigateByUrl('');
  }
}
