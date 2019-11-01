import {Component, OnDestroy, OnInit} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {UserModel} from '../models/user.model';
import {UserService} from '../authorization/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedService} from '../shared/shared.service';
import { AuthService } from "../shared/services/auth.service"
import { environment } from 'src/environments/environment';
import {SubSink} from 'subsink';
import axios from 'axios'
import {SwPush, SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  //user: UserModel;

  // Font Awesome Icons
  faWarning = faExclamationTriangle;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,
    private swPush: SwPush,

  ) {
    //this.user = this.userService.getUser();
  }

  ngOnInit(): void {
    this.changeBackgroundColor(true);
    if (!this.authService.isActivated()){
      this.showActivationPopup();
    } else {      
      if (this.swPush.isEnabled && !this.authService.userData.Setting.AppWallet){
        this.requestSubNotifications()
      }      
    }    
  }

  ngOnDestroy(): void {
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
      //https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription/getKey
      // let p256dh = sub.getKey('p256dh');
      // let auth = sub.getKey('auth');
      // console.log('sub:',sub)

      // console.log("p256dh-applicationServerKey:", p256dh)
      // console.log("auth-applicationServerKey:", auth)

      // let subs = { endpoint: sub.endpoint, keys:{p256dh: this.ToBase64(p256dh), auth: this.ToBase64(auth)}}
      
      axios.post(`${environment.api_url}api/v1/users/savesubcriber`, sub,
      { headers: { Authorization: 'Bearer ' + this.authService.userData.token}}).then(res => {
        if (res.data.errCode == environment.SUCCESS){
          console.log("subs are saved")
        }
      }).catch(err => {
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
