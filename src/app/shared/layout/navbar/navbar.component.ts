import {Component, NgZone,Input, OnDestroy, OnInit, HostListener} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
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

  walletNotices: number = 0
  algoNotices: number = 0
  generalNotices: number = 0 
  subsink:SubSink
  server:any
  serverPayment: any
  updateAvailable: boolean = false
   
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone:NgZone,
    public notificationsService: NotificationsService,
    public push: SwPush,
    public updates: SwUpdate,
    public stellarService: StellarService,
    private http: HttpClient,
    private snotifyService: SnotifyService,
    public popupService: PopupService,   
    private swUpdate: SwUpdate,
  ) {

    // if (!this.authService.userData){
    //   console.log('NAV.GetLocalUserData()')
    //   this.authService.GetLocalUserData()
    // } 
    // console.log('NAV.userMetaStore:', this.authService.userMetaStore)
    // if (!this.authService.userMetaStore || (this.authService.userMetaStore && this.authService.userMetaStore.XLM === 0)){      
    //   this.authService.GetLocalUserMeta()
    //   console.log('NAV.userMetaStore1:', this.authService.userMetaStore)
    // } else {
    //   console.log('NAV.userMetaStore:not load fromlocal')
    // }   
  
    this.server = new StellarSdk.Server(environment.horizon_url);
    //this.serverPayment = new StellarSdk.Server(environment.horizon_url_payment);
    
    // get user meta data
    this.authService.getUserMeta()
    this.authService.streamPrices()
    if (this.authService.userMetaStore.TokenExpiredTime) {
      this.scheduleCheckTokenExpiry()
    } 
    else {
      this.authService.userMeta.subscribe(data => {
        console.log('scheduleCheckTokenExpiry-data', data)        
        this.scheduleCheckTokenExpiry()
      })
    }
    
    // Get basic data    
    if (!this.authService.userInfo){
      this.http.post(`api/v1/users/getUserInfo`, {})
      .subscribe(res => {
        let data = (res as any)        
        if (data.errCode == environment.SUCCESS){ 
          console.log('NAV-getUserInfo')   
          this.authService.ParseUserInfo(data)
          this.authService.pushUserInfoMsg(this.authService.userInfo)
          //this.streaming()          
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
    this.subsink.add(push.messages.subscribe(msg => {
      let data = (msg as any).notification      
      // if (data.type === 'wallet'){
      //   console.log('navbar.UrWallet:', this.authService.userData.UrWallet)       
      //   this.authService.userData.UrWallet = +this.authService.userData.UrWallet + 1 
      //   console.log('navbar.UrWallet1:', this.authService.userData.UrWallet)       
      //   if (data.asset === 'XLM'){
      //     let amount = +data.amount
      //     this.authService.userMetaStore.XLM = (this.authService.userMetaStore.XLM + amount).toFixed(7)
      //   } else if( data.asset === 'GRX' || data.asset === 'GRXT'){
      //     let amount = +data.amount
      //     console.log('navbar.amount:', data.amount)
      //     console.log('navbar.subscribe:totalGRX0:', this.authService.userMetaStore.GRX)
      //     this.authService.userMetaStore.GRX = (+this.authService.userMetaStore.GRX + amount).toFixed(7)
      //     console.log('navbar.subscribe:totalGRX1:', this.authService.userMetaStore.GRX)
      //   }            
      // } else if (data.type === 'algo'){
      //   this.authService.userData.UrAlgo = +this.authService.userData.UrAlgo + 1
      // } else if (data.type === 'general'){
      //   this.authService.userData.UrGeneral = +this.authService.userData.UrGeneral + 1
      // }
      // this.authService.SetLocalUserData() 
    }));

    this.checkForUpdates()
    // if (updates.isEnabled) {
    //   interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
    //     .then(() => console.log('checking for updates')));
    // }
    
  }

  ngOnInit(){
    if (!this.authService.userData){
      console.log('NAV.GetLocalUserData()')
      this.authService.GetLocalUserData()
    } 
   
    if (this.authService.userMetaStore.XLM === 0){      
      this.authService.GetLocalUserMeta()
      console.log('NAV.userMetaStore1:', this.authService.userMetaStore)
    } 
    console.log('navbar.subscribe', this.ComId)
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
        // this.authService.userData.xlmPrice = xlmPrice
        // this.authService.userData.grxPrice = grxPrice
        // this.authService.SetLocalUserData()
        // console.log('NAV.this.authService.userData.xlmPrice:', this.authService.userData.xlmPrice)
        console.log('NAV.totalGRX:', this.authService.userMetaStore.GRX)
        console.log('NAV.totalXLM:', this.authService.userMetaStore.XLM)
        
      }) 
    }

    if (this.updateAvailable){
      this.promptUser()
    }
    
  }
  checkForUpdates() {
    console.log('this.checkForUpdates:')
    this.swUpdate.available.subscribe(event => {
      // prompt the user to reload the app now      
      this.updateAvailable = true;
      console.log('this.updateAvailable:', this.updateAvailable)
      this.promptUser()
    });
  }
  ngOnInit1(){
    console.log('navbar.subscribe', this.ComId)
    if (this.ComId != 'notification'){
      Promise.all([
        this.stellarService.getCurrentGrxPrice1(),
        this.stellarService.getCurrentXlmPrice1(),
        this.stellarService.getAccountBalance(this.authService.userData.PublicKey)
        .catch(err => {
          // Notify internet connection.
          //this.snotifyService.simple('Please check your internet connection.')
          console.log(err)
        })
      ])
      .then(([ grxPrice, xlmPrice, balances ]) => {         
        this.authService.userMetaStore.GRX = (balances as any).grx;
        this.authService.userMetaStore.XLM = (balances as any).xlm;
        this.authService.userData.xlmPrice = xlmPrice
        this.authService.userData.grxPrice = grxPrice
        this.authService.SetLocalUserData()
        
        console.log('NAV.totalGRX:', this.authService.userMetaStore.GRX)
        console.log('NAV.totalXLM:', this.authService.userMetaStore.XLM)
        
      }) 
    }

    
  }

  // public checkForUpdates(): void {
  //   this.subsink.add(this.updates.available.subscribe(event => this.promptUser()))
  //   if (this.updates.isEnabled) {
  //     // Required to enable updates on Windows and ios.
  //     this.updates.activateUpdate();
  //     interval(60 * 60 * 1000).subscribe(() => {
  //         this.updates.checkForUpdate().then(() => {
  //             // console.log('checking for updates');
  //         });
  //     });
  //   }
  //   // Important: on Safari (ios) Heroku doesn't auto redirect links to their https which allows the installation of the pwa like usual
  //   // but it deactivates the swUpdate. So make sure to open your pwa on safari like so: https://example.com then (install/add to home)
  // }

  promptUser(): void {
    this.updates.activateUpdate().then(() => {
        window.location.reload();
    });
  }  

  // streaming payments of account
  // streaming trade for get grx,xlm price
  streaming(){
    if (this.authService.userInfo.PublicKey){
      console.log('start streaming payments:');
      this.server.payments()
      .forAccount(this.authService.userInfo.PublicKey)
      .cursor('now')
      .stream({
        onmessage: (message)=> {          
          // this.authService.userData.UrWallet = +this.authService.userData.UrWallet + 1 
          // console.log('navbar.UrWallet1:', this.authService.userData.UrWallet) 
          
          // let amount = Number.parseFloat(message.amount.toString())     
          // if (message.from === this.authService.userInfo.PublicKey) {
          //   amount = - Number.parseFloat(message.amount.toString())
          // } 
          let amount = +(message.amount)     
          if (message.from === this.authService.userInfo.PublicKey) {
            amount = - +(message.amount)
          }   
          if (message.asset_type === 'native'){       
            console.log('navbar.subscribe:totalXLM:', this.authService.userMetaStore.XLM)   
            this.authService.userMetaStore.XLM = +this.authService.userMetaStore.XLM + amount
            console.log('navbar.subscribe:totalXLM1:', this.authService.userMetaStore.XLM)  
          } else if( message.asset_code === 'GRX' || message.asset_code === 'GRXT'){         
            console.log('navbar.amount:', message.amount)
            console.log('navbar.subscribe:totalGRX0:', this.authService.userMetaStore.GRX)
            this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX + amount            
            console.log('navbar.subscribe:totalGRX1:', this.authService.userMetaStore.GRX)
          }   
        },
      });
    }

    this.server.trades().cursor('now').stream({
      onmessage:(message) => {
        //console.log('trade:', message);
        //base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=USD&counter_asset_issuer=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX&order=desc&limit=1',
        if (message.base_asset_type === 'native' && message.counter_asset_code === 'USD' && message.counter_asset_issuer==='GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX'){
          this.authService.userData.xlmPrice = message.price.n/message.price.d
          console.log('trade usd:', this.authService.userData.xlmPrice);
        }
        //base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=USD&counter_asset_issuer=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX&order=desc&limit=1',
        if (message.base_asset_type === 'native' && message.counter_asset_code === environment.ASSET && message.counter_asset_issuer === environment.ASSET_ISSUER){
          this.authService.userData.grxPrice = message.price.d/message.price.n
          console.log('trade allOffers:', this.stellarService.allOffers);
          console.log('trade GRX:', message);
          console.log('trade GRX:', this.authService.userData.grxPrice);          
        }
 
        if (message.counter_account === this.authService.userInfo.PublicKey || message.base_account === this.authService.userInfo.PublicKey){
          if (this.ComId === "data" || this.ComId === "wallet"){
            console.log('pushShouldReload')
            if (this.authService.reload){
              this.authService.pushShouldReload(true)
            }
          }
          //this.snotifyService.simple('Your order has been matched and executed!');
        }
      }
    })  
  }

  scheduleCheckTokenExpiry(){ 
    if (this.authService.isTokenExpired()){
      console.log('token is expired, signout')
      this.signOut()
    } else {
      let remainTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime()) - 15*60*1000
      console.log('remaining time for renew token:', remainTime, this.authService.userMetaStore)
      if (remainTime >= 0){
        setTimeout(()=> {
          //will renew the token
          console.log('nav-scheduleCheckTokenExpiry-route:', this.router.url)
          this.ngZone.run(()=>{
            if ( !this.router.url.includes('confirm-password')){
            this.router.navigate([this.router.url, {outlets: {popup: 'confirm-password'}}]);
            }
          })
          console.log('will renew the token')
        }, remainTime)
      }

      // // Schedule to logout
      let logoutTime = +this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime() + 2)
      console.log('remaining time for logoutTime:', logoutTime, this.authService.userMetaStore.TokenExpiredTime)
      if (logoutTime >= 0){
        setTimeout(()=> {
          //will renew the token
          if (this.authService.isTokenExpired){
            console.log('token is expired')
            this.signOut()
          } else {
            console.log('token already renew')
          }          
        }, logoutTime)
      }
    }
  }
  @HostListener('window:beforeunload')
  ngOnDestroy():void {
    this.subsink.unsubscribe()
    console.log('destroy:', this.authService.userMetaStore)
    this.authService.SetLocalUserData()
    this.authService.SetLocalUserMeta()
  }

  signOut(){       
    localStorage.removeItem('grayll-user');    
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
    })
  }
}
