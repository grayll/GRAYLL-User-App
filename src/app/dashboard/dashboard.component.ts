import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {UserModel} from '../models/user.model';
import {UserService} from '../authorization/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedService} from '../shared/shared.service';
import { AuthService } from "../shared/services/auth.service"
import { environment } from 'src/environments/environment';
import {SubSink} from 'subsink';
import { StellarService } from '../authorization/services/stellar-service';
import {SnotifyService} from 'ng-snotify';
import {SwPush, SwUpdate} from "@angular/service-worker";
import { HttpClient } from '@angular/common/http';
import { AlgoService, AlgoMetrics } from '../system/algo.service';
import { ClosePosition } from '../system/algo-position.model';
import FPC from 'floating-point-calculator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Font Awesome Icons
  faWarning = faExclamationTriangle;
  xlmP: number
  grxP: number
  totalXLM: number
  totalGRX: number
  totalGRY: number
  totalGRZ: number
  pageId: string
 // subSink: SubSink
  
  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,    
    private algoService: AlgoService,
    public stellarService: StellarService,

  ) {
    this.pageId = "dashboard"
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
   // this.subSink = new SubSink()
    
    if (!this.authService.userInfo){
      this.authService.getUserInfoMsg().subscribe(userInfo => {
        
        if (!this.authService.isActivated()){     
          //console.log('Account is not activated:') 
          this.showActivationPopup();
        } 
        // else {   
        //   if (this.swPush.isEnabled && !this.isTokenSentToServer()){            
        //     this.requestSubNotifications()
        //   } 
        // }

        // check whether user has changed pwd
        if (this.authService.userInfo.EnSecretKey == '' && this.authService.userInfo.PublicKey != ''){
          this.router.navigate([{outlets: {popup: 'reactivate-account'}}], {relativeTo: this.route});
        }
      }) 
    } else {
      if (!this.authService.isActivated()){     
        //console.log('Account is not activated:') 
        this.showActivationPopup();
      }
      //  else {   
      //   // console.log('this.swPush.isEnabled:', this.swPush.isEnabled)  
      //   // console.log('this.authService.userData:', this.authService.userData)
        
      //   if (this.swPush.isEnabled && !this.isTokenSentToServer()){
      //     //console.log('request subs')
      //     this.requestSubNotifications()
      //   } 
      // }
       // check whether user has changed pwd
      if (this.authService.userInfo.EnSecretKey == '' && this.authService.userInfo.PublicKey != ''){
        this.router.navigate([{outlets: {popup: 'reactivate-account'}}], {relativeTo: this.route});
      }
    }
  }
 
  ngOnInit(): void {   
    this.changeBackgroundColor(true);    
    // console.log('dashboard-this.authService.userData.CreatedAt', this.authService.userData.CreatedAt)
    // if (this.authService.userData.CreatedAt < 1593536400 && !localStorage.getItem("signer-data")){
    //   this.authService.GetSecretKey(null).then(seckey => {        
    //       this.stellarService.addSigner(seckey).then(res => {
    //         console.log('added additional signer')
    //         localStorage.setItem("signer-data", "xndunfdqf")
    //       }).catch(e => {
    //         console.log('add additional signer error:', e)
    //       })        
    //     //console.log('seckey:', seckey)
    //   }).catch(err => {
    //     console.log('err:', err)
    //   })
    // }

  //   this.algoService.subOpenAlgos()
  //   this.subSink.add(this.algoService.openAlgos$.subscribe(data => {
  //     this.algoService.grzMetric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  //     this.algoService.gry1Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  //     this.algoService.gry2Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  //     this.algoService.gry3Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  //     this.algoService.gryMetric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}

  //     this.algoService.openPositions = data
  //     this.algoService.openPositions.forEach(pos => {
  //       switch (pos.algorithm_type){
  //         case "GRZ":             
  //           this.calculateMetrics(pos, this.algoService.grzMetric)
  //           break
  //         case "GRY 1":
  //           this.calculateMetrics(pos, this.algoService.gry1Metric)     
  //           // Calculate total gry metric
  //           this.calculateMetrics(pos, this.algoService.gryMetric)
  //           break
  //         case "GRY 2":
  //           this.calculateMetrics(pos, this.algoService.gry2Metric)
  //           // Calculate total gry metric
  //           this.calculateMetrics(pos, this.algoService.gryMetric)          
  //           break
  //         case "GRY 3":
  //           this.calculateMetrics(pos, this.algoService.gry3Metric)
  //           // Calculate total gry metric
  //           this.calculateMetrics(pos, this.algoService.gryMetric)          
  //           break
  //       } 
  //     })
  //   }))

   }
  // calculateMetrics(pos: ClosePosition, metric : AlgoMetrics){  
  //   //console.log('CALCULATE-pos.current_position_ROI_$:', pos.current_position_ROI_$) 
  //   metric.CurrentProfit = FPC.add(metric.CurrentProfit, pos.current_position_ROI_$) 
  //   metric.TotalValue = FPC.add(metric.TotalValue, pos.current_position_value_$)
  //   metric.Positions +=1
             
  //   // if (pos.duration <= 1440*60){
  //   //   metric.OneDayPercent = FPC.add(metric.OneDayPercent, pos.current_position_ROI_percent)
  //   //   metric.OneDayCnt++
  //   // }
  //   // if (pos.duration <= 10080*60){
  //   //   metric.SevenDayPercent = FPC.add(metric.SevenDayPercent, pos.current_position_ROI_percent)
  //   //   metric.SevenDayCnt++
  //   // }
  //   // metric.ROIPercent = FPC.add(metric.ROIPercent, pos.current_position_ROI_percent)
    
  // }
  isTokenSentToServer() {
    return localStorage.getItem('sentToServer') === '1';
  }
  setTokenSentToServer(sent) {
    localStorage.setItem('sentToServer', sent ? '1' : '0');
  }
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.authService.RemoveSeedData()
    this.changeBackgroundColor(false);
    //this.subSink.unsubscribe() 
  } 

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }

  private showActivationPopup() {
    this.router.navigate([{outlets: {popup: 'activate-account'}}], {relativeTo: this.route});
  }
  
  //Its easy to navigate to page using angular router, btw (instead of window.open) but this is not solution in case PWA is not running already.
  //this.router.navigateByUrl(notpayload.notification.data.url)
  requestSubNotifications() {    
    const VAPID_PUBLIC_KEY = "BGHhiED8J7t9KwJlEgNXT-EDIJQ1RZPorhuSYtufaRezRTGhofadZtrgZ8MVa0pwISEyBZRaYa-Bzl9MHtwaF9s"
    this.swPush.requestSubscription({
        serverPublicKey: VAPID_PUBLIC_KEY
    }).then(sub => {       
      this.http.post(`api/v1/users/savesubcriber`, sub)
      .subscribe(res => {
        if ((res as any).errCode == environment.SUCCESS){
          //console.log("subs are saved")
          this.setTokenSentToServer(true) 
        }
      },
      err => {
        //console.log("subs err:", err)
      })
    }).catch(err => 
      { console.error("Could not subscribe to notifications", err)}
    );
  }

  ToBase64 = function (u8) {
    return btoa(String.fromCharCode.apply(null, u8));
  }

  

}

