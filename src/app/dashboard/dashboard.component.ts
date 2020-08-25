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
      
    if (!this.authService.userInfo){
      this.authService.getUserInfoMsg().subscribe(userInfo => {        
        if (!this.authService.isActivated()){     
          //console.log('Account is not activated:') 
          this.showActivationPopup();
        } 
        else {   
          if (this.swPush.isEnabled && !this.isTokenSentToServer()){            
            this.requestSubNotifications()
          } 
        }

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
       else {                
        if (this.swPush.isEnabled && !this.isTokenSentToServer()){          
          this.requestSubNotifications()
        } 
      }
       // check whether user has changed pwd
      if (this.authService.userInfo.EnSecretKey == '' && this.authService.userInfo.PublicKey != ''){
        this.router.navigate([{outlets: {popup: 'reactivate-account'}}], {relativeTo: this.route});
      }
    }
  }
 
  ngOnInit(): void {   
    this.changeBackgroundColor(true);
   }
  
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
    this.setTokenSentToServer(true)   
    // const VAPID_PUBLIC_KEY = "BGHhiED8J7t9KwJlEgNXT-EDIJQ1RZPorhuSYtufaRezRTGhofadZtrgZ8MVa0pwISEyBZRaYa-Bzl9MHtwaF9s"
    // this.swPush.requestSubscription({
    //     serverPublicKey: VAPID_PUBLIC_KEY
    // }).then(sub => {          
    //   this.http.post(`api/v1/users/savesubcriber`, sub)
    //   .subscribe(res => {
    //     if ((res as any).errCode == environment.SUCCESS){
    //       //console.log("subs are saved")
    //       this.setTokenSentToServer(true) 
    //     }
    //   },
    //   err => {
    //     //console.log("subs err:", err)
    //   })
    // }).catch(err => 
    //   { console.error("Could not subscribe to notifications", err)}
    // )
  }

  ToBase64 = function (u8) {
    return btoa(String.fromCharCode.apply(null, u8));
  }

  

}

