import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {ErrorService} from '../../../shared/error/error.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../shared/shared.service';
//import { ReCaptchaV3Service } from 'ng-recaptcha';
import axios from 'axios'
import { environment } from 'src/environments/environment';
import { AuthService } from "../../../shared/services/auth.service"
import * as firebase from 'firebase/app';
import {SnotifyService} from 'ng-snotify';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-change-phone-number',
  templateUrl: './change-phone-number.component.html',
  styleUrls: ['./change-phone-number.component.css']
})
export class ChangePhoneNumberComponent implements OnInit {

  @ViewChild('content') modal;
  selectedCountryCode: string;
  phoneNumber: string;
  public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  public token: any;

  countryCodes = [
    'af', 'al', 'dz', 'as', 'ad', 'ao', 'ai', 'aq', 'ag', 'ar', 'am', 'aw', 'au', 'at', 'az', 'bs', 'bh', 'bd', 'bb', 'by', 'be', 'bz',
    'bj', 'bm', 'bt', 'bo', 'ba', 'bw', 'bv', 'br', 'io', 'bn', 'bn', 'bg', 'bf', 'bi', 'kh', 'cm', 'ca', 'cv', 'ky', 'cf', 'td', 'cl',
    'cn', 'cx', 'cc', 'co', 'km', 'cg', 'ck', 'cr', 'ci', 'ci', 'hr', 'cu', 'cy', 'cz', 'dk', 'dj', 'dm', 'do', 'ec', 'eg', 'sv', 'gq',
    'er', 'ee', 'et', 'fk', 'fo', 'fj', 'fi', 'fr', 'gf', 'pf', 'tf', 'ga', 'gm', 'ge', 'de', 'gh', 'gi', 'gr', 'gl', 'gd', 'gp', 'gu',
    'gt', 'gg', 'gn', 'gw', 'gy', 'ht', 'hm', 'va', 'hn', 'hk', 'hu', 'is', 'in', 'id', 'iq', 'ie', 'im', 'il', 'it', 'jm', 'jp', 'je',
    'jo', 'kz', 'ke', 'ki', 'kr', 'kw', 'kg', 'la', 'lv', 'lb', 'ls', 'lr', 'ly', 'ly', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'my', 'mv',
    'ml', 'mt', 'mh', 'mq', 'mr', 'mu', 'yt', 'mx', 'mc', 'mn', 'me', 'ms', 'ma', 'mz', 'mm', 'mm', 'na', 'nr', 'np', 'nl', 'an', 'nc',
    'nz', 'ni', 'ne', 'ng', 'nu', 'nf', 'mp', 'no', 'om', 'pk', 'pw', 'pa', 'pg', 'py', 'pe', 'ph', 'pn', 'pl', 'pt', 'pr', 'qa', 're',
    'ro', 'ru', 'ru', 'rw', 'kn', 'lc', 'pm', 'vc', 'vc', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 'sc', 'sl', 'sg', 'sk', 'si', 'sb',
    'so', 'za', 'gs', 'es', 'lk', 'sd', 'sr', 'sj', 'sz', 'se', 'ch', 'sy', 'tw', 'tj', 'th', 'tl', 'tg', 'tk', 'to', 'tt', 'tt', 'tn',
    'tr', 'tm', 'tc', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'um', 'uy', 'uz', 'vu', 've', 'vn',  'wf', 'eh', 'ye', 'zm', 'zw'
  ];

  constructor(
    public popupService: PopupService,
    private errorService: ErrorService,
    private router: Router, 
    public authService: AuthService, 
    //private recaptchaV3Service: ReCaptchaV3Service,
    private snotifyService: SnotifyService,
    private sharedService: SharedService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.selectedCountryCode = 'af';   
    this.popupService.open(this.modal);
  }
  
  clientValidation(): boolean {
    if (!this.phoneNumber || (this.phoneNumber && this.phoneNumber === '')) {
      this.errorService.handleError(null, 'Please enter your phone number.');
      return false;
    }
    return true;
  }
  // this.recaptchaVerifier.render().then(function (widgetId) {
  //   window.recaptchaWidgetId = widgetId;
  // });
  verify() {
    
    if (this.clientValidation()) { 
      console.log("form is valid 1")    
      
      this.http.post(`api/v1/users/validatePhone`, {phone:this.phoneNumber})
      .subscribe(res => {        
        if ((res as any).errCode === environment.SUCCESS){
          this.popupService.close().then(() => {
            this.snotifyService.simple('Your phone number is verified and saved!');
          });
        } else if ((res as any).errCode === environment.PHONE_EXIST){
          this.errorService.handleError(null, 'This phone number is already registered!');
        } else if ((res as any).errCode === environment.INTERNAL_ERROR){
          this.errorService.handleError(null, 'Your phone number can’t be verified! Please retry.');
        } 
      },
      e => {
        this.errorService.handleError(null, 'Your phone number can’t be verified! Please retry.');
      })
      // this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      //   'size': 'invisible',
      //   'callback': function(response) {
      //     // reCAPTCHA solved - will proceed with submit function
      //     this.token = response
      //     console.log(response)
      //     axios.post(`${environment.api_url}api/v1/phones/sendcode`, 
      //     {recaptchaToken:this.token, phoneNumber:this.phoneNumber},
      //     { headers: {Authorization: 'Bearer ' + this.authService.userData.token} }).then(res =>{
      //       if (res.data.valid === true){

      //         this.sharedService.showModalOverview();
      //         this.popupService.close().then(() => {
      //           setTimeout(() => {
      //             this.router.navigate(['/settings/profile', {outlets: {popup: ['verify-phone-number', this.phoneNumber]}}]);
      //           }, 50);
      //         });
      //       } else {
      //         this.errorService.handleError(null, 'Please enter a valid phone number!');
      //       }
      //     })            
      //   },
      //   'expired-callback': function() {
      //     console.log('reset capcha')
      //   }
      // });
     
            
      // })     
    } else {
      console.log("form is invalid")
    }
  }
  
}
