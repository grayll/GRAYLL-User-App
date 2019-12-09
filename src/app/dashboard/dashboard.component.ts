import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {SwPush} from "@angular/service-worker";
import { HttpClient } from '@angular/common/http';

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

  // constructor(
  //   public sharedService: SharedService,
  //   public stellarService: StellarService,
  //   public authService: AuthService,
  //   private snotifyService: SnotifyService,
  // ) {
  //   if (!this.authService.userData){
  //     this.authService.GetLocalUserData()
  //   }
  //   console.log('getLoanPaid:', this.sharedService.getLoanPaid())
  //   Promise.all([
  //     this.stellarService.getCurrentGrxPrice1(),
  //     this.stellarService.getCurrentXlmPrice1(),
  //     this.stellarService.getAccountData(this.authService.userData.PublicKey)
  //     .catch(err => {
  //       // Notify internet connection.
  //       this.snotifyService.simple('Please check your internet connection.')
  //       console.log(err)
  //     })
  //   ])
  //   .then(([ grx, xlm, account ]) => {
  //     console.log(grx, xlm)      
  //     this.stellarService.userAccount = account;
  //     this.stellarService.publishPrices([+grx,+xlm])
      
  //   })
  //  }

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,    
    private snotifyService: SnotifyService,
    public stellarService: StellarService,

  ) {
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
    console.log('getLoanPaid:', this.sharedService.getLoanPaid())
    if (this.authService.isActivated()){
      if (this.swPush.isEnabled && !this.isTokenSentToServer()){
        console.log('request subs')
        this.requestSubNotifications()
      } 
      // Promise.all([
      //   this.stellarService.getCurrentGrxPrice1(),
      //   this.stellarService.getCurrentXlmPrice1(),
      //   this.stellarService.getAccountData(this.authService.userData.PublicKey)
      //   .catch(err => {
      //     // Notify internet connection.
      //     this.snotifyService.simple('Please check your internet connection.')
      //     console.log(err)
      //   })
      // ])
      // .then(([ grx, xlm, account ]) => {
      //   console.log(grx, xlm)   
      //   this.xlmP = +xlm
      //   this.grxP = +grx
      //   this.stellarService.userAccount = account;   
      //   this.stellarService.getBlFromAcc(this.stellarService.userAccount, res => {
      //     //this.fillWalletData(res) 
      //     this.totalXLM = res.xlm;
      //     this.totalGRX = res.grx;  
      //     this.stellarService.publishPrices([this.xlmP, this.grxP, this.totalXLM, this.totalGRX])
      //   })
      // }) 
    } 
  }

  ngOnInit(): void {
    // if(!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
    this.changeBackgroundColor(true);
    if (!this.authService.isActivated()){
      console.log('not activated, show activate pop-up')
      this.showActivationPopup();
    } else {   
      console.log('this.swPush.isEnabled:', this.swPush.isEnabled)  
      console.log('this.authService.userData:', this.authService.userData)           
    }  
    console.log('dashboard-OpenOrders', this.authService.userData.OpenOrders)
    this.authService.GetSecretKey(null).then(seckey => {
      //console.log('seckey:', seckey)
    }).catch(err => {
      console.log('err:', err)
    })

  }

  isTokenSentToServer() {
    return localStorage.getItem('sentToServer') === '1';
  }
  setTokenSentToServer(sent) {
    localStorage.setItem('sentToServer', sent ? '1' : '0');
  }

  ngOnDestroy(): void {
    this.authService.RemoveSeedData()
    this.changeBackgroundColor(false);
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
          console.log("subs are saved")
          this.setTokenSentToServer(true) 
        }
      },
      err => {
        console.log("subs err:", err)
      })
    }).catch(err => 
      { console.error("Could not subscribe to notifications", err)}
    );
  }

  ToBase64 = function (u8) {
    return btoa(String.fromCharCode.apply(null, u8));
  }
}
