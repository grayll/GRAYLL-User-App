import {Component, NgZone,Input, OnDestroy, OnInit} from '@angular/core';
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
  ) {
    this.server = new StellarSdk.Server(environment.horizon_url);
    // Get basic data
    if (!this.authService.userInfo){
      this.http.post(`api/v1/users/getUserInfo`, {})
      .subscribe(res => {
        let data = (res as any)        
        if (data.errCode == environment.SUCCESS){   
          this.authService.ParseUserInfo(data)
          this.authService.pushUserInfoMsg(this.authService.userInfo) 
          this.streaming()          
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
            this.streaming() 
          } else {
            //this.errorService.handleError(null, `The request could not be performed! Please retry.`);
          }        
        },
        e => {
          console.log(e)        
        })
      })
    } else {
      this.streaming()  
    }

    this.subsink = new SubSink()    
    if (!this.authService.userData){
      console.log('NAV.GetLocalUserData()')
      this.authService.GetLocalUserData()
    }   
    

    this.subsink.add(push.messages.subscribe(msg => {
      let data = (msg as any).notification      
      if (data.type === 'wallet'){
        // console.log('navbar.UrWallet:', this.authService.userData.UrWallet)       
        // this.authService.userData.UrWallet = +this.authService.userData.UrWallet + 1 
        // console.log('navbar.UrWallet1:', this.authService.userData.UrWallet)       
        // if (data.asset === 'XLM'){
        //   let amount = +data.amount
        //   this.authService.userData.totalXLM = (+this.authService.userData.totalXLM + amount).toFixed(7)
        // } else if( data.asset === 'GRX' || data.asset === 'GRXT'){
        //   let amount = +data.amount
        //   console.log('navbar.amount:', data.amount)
        //   console.log('navbar.subscribe:totalGRX0:', this.authService.userData.totalGRX)
        //   this.authService.userData.totalGRX = (+this.authService.userData.totalGRX + amount).toFixed(7)
        //   console.log('navbar.subscribe:totalGRX1:', this.authService.userData.totalGRX)
        // }            
      } else if (data.type === 'algo'){
        this.authService.userData.UrAlgo = +this.authService.userData.UrAlgo + 1
      } else if (data.type === 'general'){
        this.authService.userData.UrGeneral = +this.authService.userData.UrGeneral + 1
      }
      this.authService.SetLocalUserData() 
    }));

    // if (updates.isEnabled) {
    //   interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
    //     .then(() => console.log('checking for updates')));
    // }
    this.scheduleCheckTokenExpiry()
  }

  ngOnInit(){
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
        this.authService.userData.totalGRX = (balances as any).grx;
        this.authService.userData.totalXLM = (balances as any).xlm;
        this.authService.userData.xlmPrice = xlmPrice
        this.authService.userData.grxPrice = grxPrice
        this.authService.SetLocalUserData()
        console.log('NAV.this.authService.userData.xlmPrice:', this.authService.userData.xlmPrice)
        console.log('NAV.totalGRX:', this.authService.userData.totalGRX)
        console.log('NAV.totalXLM:', this.authService.userData.totalXLM)
        
      }) 
    }
  }

  public checkForUpdates(): void {
    this.subsink.add(this.updates.available.subscribe(event => this.promptUser()))
    if (this.updates.isEnabled) {
      // Required to enable updates on Windows and ios.
      this.updates.activateUpdate();
      interval(60 * 60 * 1000).subscribe(() => {
          this.updates.checkForUpdate().then(() => {
              // console.log('checking for updates');
          });
      });
    }
    // Important: on Safari (ios) Heroku doesn't auto redirect links to their https which allows the installation of the pwa like usual
    // but it deactivates the swUpdate. So make sure to open your pwa on safari like so: https://example.com then (install/add to home)
  }

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
          this.authService.userData.UrWallet = +this.authService.userData.UrWallet + 1 
          console.log('navbar.UrWallet1:', this.authService.userData.UrWallet) 
          
          let amount = +message.amount     
          if (message.from === this.authService.userInfo.PublicKey) {
            amount = - +message.amount  
          }    
          if (message.asset_type === 'native'){       
            console.log('navbar.subscribe:totalXLM:', this.authService.userData.totalXLM)   
            this.authService.userData.totalXLM = (+this.authService.userData.totalXLM + amount).toFixed(7)
            console.log('navbar.subscribe:totalXLM1:', this.authService.userData.totalXLM)  
          } else if( message.asset_code === 'GRX' || message.asset_code === 'GRXT'){         
            console.log('navbar.amount:', message.amount)
            console.log('navbar.subscribe:totalGRX0:', this.authService.userData.totalGRX)
            this.authService.userData.totalGRX = (+this.authService.userData.totalGRX + amount).toFixed(7)
            console.log('navbar.subscribe:totalGRX1:', this.authService.userData.totalGRX)
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
          if (this.ComId === "data" || this.ComId === "wallet" || this.ComId === "data"){
            this.authService.pushShouldReload(true)
          }
          this.snotifyService.simple('Your order has been matched and executed!');
        }
      }
    })  
  }

  scheduleCheckTokenExpiry(){  
    let remainTime = this.authService.userData.tokenExpiredTime*1000 - (new Date().getTime()) - 15*60*1000
    console.log('remaining time for renew token:', remainTime)
    if (remainTime >= 0){
      setTimeout(()=> {
        //will renew the token
        console.log('route:', this.router.url)

        //this.popupService.open() this.router.navigate([{ outlets: { popup: null } }])
        //this.router.navigate(['/wallet/overview', {outlets: {popup: 'input-password'}}]);
        this.ngZone.run(()=>{
          this.router.navigate([this.router.url, {outlets: {popup: 'confirm-password'}}]);
        })
        console.log('will renew the token')
      }, remainTime)
//this.router.navigate(['/settings/profile', {outlets: {popup: 'enable-multisignature'}}]);
      // this.popupService.observeValidation().subscribe(valid => { /dashboard/overview
      //     if (valid){
      //       this.authService.userInfo.token = 
      //     }
      // })
    }
  }

  getAllUnreadNumber(){
    if (this.authService.userData){
      return (+this.authService.userData.UrAlgo + +this.authService.userData.UrWallet + +this.authService.userData.UrGeneral)
    }      
    return 0    
  }

  ngOnDestroy():void {
    this.subsink.unsubscribe()
  }

  signOut(){
    
    //this.authService.SignOut();
    // console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    // this.ngZone.run(()=>{
    //   //this.router.navigate(['/login'])
    // })
    console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    localStorage.removeItem('user');    
    this.authService.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
      // return this.firebaseAuth.auth.signOut().then(() => {
      //   console.log('SignOut')
      //   localStorage.removeItem('user');
      //   this.userData = null  
      // }).catch(err =>{
      //   console.log('Err:', err)
      // })
    })
  }

}
