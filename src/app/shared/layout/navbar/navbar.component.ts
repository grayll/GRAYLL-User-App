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

import { AlgoMetrics, AlgoService } from 'src/app/system/algo.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { ReferralService } from 'src/app/referral/referral.service';
import { LogoutService } from '../../services/logout.service';
import { SnotifyService } from 'ng-snotify';
import { AdminService } from 'src/app/admin/admin.service';
import { LoadingService } from '../../services/loading.service';
import * as moment from 'moment';
import { ClosePosition } from 'src/app/system/algo-position.model';
import FPC from 'floating-point-calculator';

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
      this.authService.isSubUserMeta = true          
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
      this.authService.isSubPrice = true
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
    
    // Sub all algo position data here
    this.algoService.subsAlgoPositions()
    if (!this.authService.isSubPosition) {
      this.authService.isSubPosition = true
     // console.log('SUB POSITION:', this.authService.isSubPosition)
      this.authService.subsink.add(this.algoService.algoPositions$.subscribe(positions => {    
        if (!positions){
          return
        }       
        let positionClosed = true      
        
        this.algoService.grzMetric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
        this.algoService.gry1Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
        this.algoService.gry2Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
        this.algoService.gry3Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
        this.algoService.gryMetric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}      
        
        this.algoService.openPositions = positions.filter(pos => {
          if (pos.status == "OPEN"){               
            pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
            if (pos.open_stellar_transaction_id) {
              pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.open_stellar_transaction_id  
            } else {
              pos.url = ""
            }   
            if (this.algoService.closeGrayllId === pos.grayll_transaction_id){
              positionClosed = false
            }

            switch (pos.algorithm_type){
              case "GRZ":             
                this.calculateMetrics(pos, this.algoService.grzMetric)
                break
              case "GRY 1":
                this.calculateMetrics(pos, this.algoService.gry1Metric)     
                // Calculate total gry metric
                this.calculateMetrics(pos, this.algoService.gryMetric)
                break
              case "GRY 2":
                this.calculateMetrics(pos, this.algoService.gry2Metric)
                // Calculate total gry metric
                this.calculateMetrics(pos, this.algoService.gryMetric)          
                break
              case "GRY 3":
                this.calculateMetrics(pos, this.algoService.gry3Metric)
                // Calculate total gry metric
                this.calculateMetrics(pos, this.algoService.gryMetric)          
                break
            }          
            return pos
          }        
        })

        if (this.algoService.closeGrayllId && positionClosed === true){
          this.loadingService.hide()
          this.algoService.closeGrayllId = ''
        }
        
        switch (this.algoService.closingAllAlgo){
          case "GRZ":             
            if (this.algoService.grzMetric.Positions == 0) {
              this.authService.pushCloseAllEnd(true)
            }
            break
          case "GRY 1":
            if (this.algoService.gry1Metric.Positions == 0) {
              this.authService.pushCloseAllEnd(true)
            }
            break
          case "GRY 2":
            if (this.algoService.gry2Metric.Positions == 0) {
              this.authService.pushCloseAllEnd(true)
            }
            break
          case "GRY 3":
            if (this.algoService.gry3Metric.Positions == 0) {
              this.authService.pushCloseAllEnd(true)
            }      
            break
        } 
            
        this.updateAverageMetric(this.algoService.grzMetric, "grz")
        this.updateAverageMetric(this.algoService.gry1Metric, "gry1")      
        this.updateAverageMetric(this.algoService.gry2Metric, "gry2")
        this.updateAverageMetric(this.algoService.gry3Metric, "gry3")
        
        // console.log('this.algoService.openPositions', this.algoService.openPositions)
        // console.log('this.algoService.grzMetric', this.algoService.grzMetric)

        this.algoService.closePositions = positions.filter(pos => {
          if (pos.status == "CLOSED"){          
            pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
            pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.close_stellar_transaction_id.toString() 

            switch (pos.algorithm_type){
              case "GRZ":             
                this.calculateClosedProfitMetrics(pos, this.algoService.grzMetric)
                break
              case "GRY 1":
                this.calculateClosedProfitMetrics(pos, this.algoService.gry1Metric)     
                // Calculate total gry metric
                this.calculateClosedProfitMetrics(pos, this.algoService.gryMetric)
                break
              case "GRY 2":
                this.calculateClosedProfitMetrics(pos, this.algoService.gry2Metric)
                // Calculate total gry metric
                this.calculateClosedProfitMetrics(pos, this.algoService.gryMetric)          
                break
              case "GRY 3":
                this.calculateClosedProfitMetrics(pos, this.algoService.gry3Metric)
                // Calculate total gry metric
                this.calculateClosedProfitMetrics(pos, this.algoService.gryMetric)          
                break
            }  
            return pos
          }        
        })
      
        this.algoService.allPositions = positions.filter(pos => {     
          if (pos.status != "OPEN"){
            //pos.close_position_ROI_per = pos['close_position_ROI_%']
            pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')         
            pos.url = "https://stellar.expert/explorer/public/search?term=" + (pos.close_stellar_transaction_id || 1).toString()  
            return pos 
          }
        })

        //console.log('closed profit:', this.algoService.gry1Metric.ClosedProfit, this.algoService.grzMetric.ClosedProfit, this.algoService.gryMetric.ClosedProfit)
      }))
    }
  }
  calculateMetrics(pos: ClosePosition, metric : AlgoMetrics){  
    //console.log('CALCULATE-pos.current_position_ROI_$:', pos.current_position_ROI_$) 
    metric.CurrentProfit = FPC.add(metric.CurrentProfit, pos.current_position_ROI_$) 
    metric.TotalValue = FPC.add(metric.TotalValue, pos.current_position_value_$)
    metric.Positions +=1
  }

  calculateClosedProfitMetrics(pos: ClosePosition, metric : AlgoMetrics){
    metric.ClosedProfit = FPC.add(metric.ClosedProfit, pos.current_position_ROI_$)
  }

  updateAverageMetric(metric : AlgoMetrics, type: string){
    
    switch(type){
      case "grz":
        this.authService.userMetaStore.total_grz_open_positions = this.algoService.grzMetric.Positions
        this.authService.userMetaStore.total_grz_current_position_ROI_$ = this.algoService.grzMetric.CurrentProfit
        this.authService.userMetaStore.total_grz_current_position_value_$ = this.algoService.grzMetric.TotalValue      
        break
      case "gry1":
        this.authService.userMetaStore.total_gry1_open_positions = this.algoService.gry1Metric.Positions
        this.authService.userMetaStore.total_gry1_current_position_ROI_$ = this.algoService.gry1Metric.CurrentProfit
        this.authService.userMetaStore.total_gry1_current_position_value_$ = this.algoService.gry1Metric.TotalValue
      case "gry2":
        this.authService.userMetaStore.total_gry2_open_positions = this.algoService.gry2Metric.Positions
        this.authService.userMetaStore.total_gry2_current_position_ROI_$ = this.algoService.gry2Metric.CurrentProfit
        this.authService.userMetaStore.total_gry2_current_position_value_$ = this.algoService.gry2Metric.TotalValue
        break
      case "gry3":
        this.authService.userMetaStore.total_gry3_open_positions = this.algoService.gry3Metric.Positions
        this.authService.userMetaStore.total_gry3_current_position_ROI_$ = this.algoService.gry3Metric.CurrentProfit
        this.authService.userMetaStore.total_gry3_current_position_value_$ = this.algoService.gry3Metric.TotalValue
        break  
    }
  
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
   
    if (this.ComId != 'notification' && this.authService.userData.PublicKey){      
      this.stellarService.getAccountBalance(this.authService.userData.PublicKey)      
      .then(balances => {        
        let bl = balances as any
        //console.log(bl)
        if  (bl && bl.grx && bl.xlm){ 
          // check balance and udpate
          // console.log('this.authService.userMetaStore.GRX:', this.authService.userMetaStore.GRX, 'bl.grx', bl.grx)
          // console.log('this.authService.userMetaStore.XLM ', this.authService.userMetaStore.XLM , 'bl.xlm', bl.xlm)
          if (this.authService.userMetaStore.GRX != +bl.grx || this.authService.userMetaStore.XLM != +bl.xlm){
            //console.log('BL update')
            this.authService.userMetaStore.GRX = +bl.grx;
            this.authService.userMetaStore.XLM = +bl.xlm;
            this.authService.updateUserMeta(false)
          }
          
        } else if (balances && !bl.grx ){ // accout did not trust GRX
          this.stellarService.trustAsset(this.stellarService.SecretBytesToString(this.authService.secretKey))
        }
        this.authService.isGetBalance = true

        if (bl && bl.domain ){
          if (!bl.domain.includes('grayll.io')){            
            this.http.post(`api/v1/users/updateHomeDomain`, {}).subscribe(res => {
              this.signOut()
            },
            e => console.log(e) )
          } 
          // else {
          //   // need to set home domain
          //   console.log('SetHomeDomain  lobstr to test')
          // this.stellarService.SetHomeDomain(this.stellarService.SecretBytesToString(this.authService.secretKey)).then(
          //   res => console.log('SetHomeDomain successfully')
          // ).catch(e => console.log('SetHomeDomain err', e))
          // }
        } else if (!bl.domain){
          // need to set home domain
          this.stellarService.SetHomeDomain(this.stellarService.SecretBytesToString(this.authService.secretKey))
        }
      }).catch(err => {
        console.log(err)
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
