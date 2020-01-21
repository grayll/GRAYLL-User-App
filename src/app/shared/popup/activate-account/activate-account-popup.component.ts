import {Component, OnInit, ViewChild, OnDestroy, HostListener} from '@angular/core';
import {PopupService} from '../popup.service';
import {Router} from '@angular/router';
import {UserService} from '../../../authorization/user.service';
import { AuthService } from "../../../shared/services/auth.service"
import { User, Setting } from "../../../shared/services/user";
import { StellarService } from '../../../authorization/services/stellar-service';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ErrorService} from '../../../shared/error/error.service';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import axios from 'axios';
import { environment } from 'src/environments/environment';
const bip39 = require('bip39')
var naclutil = require('tweetnacl-util');
import { HttpClient } from '@angular/common/http';
import {SwPush} from "@angular/service-worker";

@Component({
  selector: 'app-pay-loan-popup',
  templateUrl: './activate-account-popup.html',
  styleUrls: ['./activate-account-popup.component.scss']
})
export class ActivateAccountPopupComponent implements OnInit, OnDestroy {

  @ViewChild('content') modal;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  frm: FormGroup;
  
  isSecretKeyRevealed: boolean;
  secretKey: string;
  password: string;
  seed: string;
  firstPopup: boolean;
  hideCloseButton: boolean;
  displayFinalLayOffLoanPopup: boolean;
  canGoToDeposit: boolean;
  onCloseRedirectTo: string;
  isSubmitted:boolean = false;

  constructor(
    private popupService: PopupService,
    private router: Router,
    private swPush: SwPush,
    public authService: AuthService,
    private stellarService: StellarService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private http: HttpClient,
  ) { 
  
    this.firstPopup = true;
    this.secretKey = '                                                        ';
    this.seed = '';
    this.onCloseRedirectTo = '/dashboard/overview';
    if (this.authService.isActivated()){
      this.router.navigateByUrl('/dashboard/overview')
    } else {
      console.log(this.authService.userData.PublicKey)
    }
  }

  ngOnInit() {
    this.buildForm() 
    this.popupService.open(this.modal);
  }
  @HostListener('window:beforeunload')
  ngOnDestroy(){
    this.authService.RemoveSeedData()
    if (this.authService.isActivated()){      
      if (this.swPush.isEnabled && !this.isTokenSentToServer()){
        console.log('activate-request subs')
        this.requestSubNotifications()
      } else {
        console.log('activate-not request subs')
      } 
    }
  }
  isTokenSentToServer() {
    return localStorage.getItem('sentToServer') === '1';
  }
  setTokenSentToServer(sent) {
    localStorage.setItem('sentToServer', sent ? '1' : '0');
  }
  buildForm(): void {    
    this.frm = this.formBuilder.group({      
      'password': ['', [       
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
        Validators.minLength(8),
        Validators.maxLength(36)
       ]
      ],  
    });
  }
  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.frm) { return; }
    const form = this.frm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      
      if (control && control.invalid) {        
        const messages = this.validationMessages[field];       
        
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {    
    'password': '',    
  };

  validationMessages = {      
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },    
  };
  activate() {    
    if (this.isSubmitted){
      return
    }
    this.isSubmitted = true
    
    this.errorService.clearError();
    this.onValueChanged()

    if (this.authService.hash && this.authService.hash != '' && this.frm.value['password'] != this.authService.hash){
      this.errorService.handleError(null, "Please enter a valid password!")
      return
    }

    this.stellarService.makeSeedAndRecoveryPhrase(this.authService.userData.Email, res => {
      //console.log('phrase:', res.recoveryPhrase)  
      this.stellarService.encryptSecretKey(this.frm.value['password'], res.keypair.rawSecretKey(), (enSecret) => { 
        let data = {password:this.frm.value['password'], publicKey: res.keypair.publicKey(), 
          enSecretKey:enSecret.EnSecretKey, salt: enSecret.Salt}
              
        this.http.post(`api/v1/users/validateaccount`, data)
        .subscribe(resp => {
          console.log(resp)
          if ((resp as any).errCode === environment.SUCCESS){                
            this.stellarService.trustAsset(res.keypair.secret()).then(
              txd => {
                this.hideCloseButton = true;
                this.firstPopup = false;
                this.secretKey = res.keypair.secret()
                this.seed = res.recoveryPhrase  
                this.error = false;
                this.success = true;       
                this.authService.userData.PublicKey = res.keypair.publicKey()                     
                this.authService.SetLocalUserData() 
                this.authService.RemoveSeedData()                
              },
              err => {
                console.log('err trust asset:', err)                 
                this.error = true;
                this.success = false;
              }
            ).catch(e => {
              console.log('trustAsset.create error: ', e)
              this.error = true;
              this.success = false;
            })                                            
          } else if ((resp as any).errCode === environment.INVALID_UNAME_PASSWORD){
            this.frm.reset()
             this.errorService.handleError(null, "Please enter a valid password!")
          } else {
            this.frm.reset()
            this.errorService.handleError(null, "The account could not be activated! Please retry.")
          }
        },
        err => {
          console.log(err)
          this.error = true;
          this.success = false;
        })
      })       
    })         
  }  
 

  retry() {
    this.error = false;
    this.success = false;
    this.isSubmitted = false;
    this.activate()
  }

  //Its easy to navigate to page using angular router, btw (instead of window.open) but this is not solution in case PWA is not running already.
  //this.router.navigateByUrl(notpayload.notification.data.url)
  requestSubNotifications() {    
    const VAPID_PUBLIC_KEY = "BGHhiED8J7t9KwJlEgNXT-EDIJQ1RZPorhuSYtufaRezRTGhofadZtrgZ8MVa0pwISEyBZRaYa-Bzl9MHtwaF9s"
    this.swPush.requestSubscription({
        serverPublicKey: VAPID_PUBLIC_KEY
    }).then(sub => {       
      this.http.post(`api/v1/users/savesubcriber`, sub).subscribe(res => {
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

  copySecretKey() {
    if (this.clipboardService.copyFromContent(this.secretKey)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  copySeed() {
    if (this.clipboardService.copyFromContent(this.seed)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  displayLoan() {
    this.displayFinalLayOffLoanPopup = true;
    this.canGoToDeposit = true;
    this.error = false;
    this.success = false;
    this.hideCloseButton = false;    
  }
  goToDeposit() {
    console.log('goToDeposit')
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/dashboard/overview', {outlets: {popup: 'deposit'}}]);
      }, 100);
    });

    // this.popupService.close().then(() => {
    //   this.router.navigate(['/wallet/overview', {outlets: {popup: 'deposit'}}]);
    // });
  }
}
  
// clientValidation(): boolean {
//     if (!this.password || (this.password && this.password === '')) {
//       this.errorService.handleError(null, 'You must enter a password to activate your GRAYLL account.');
//       return false;
//     }
//     return true;
//   }
// }
