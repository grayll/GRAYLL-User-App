import {Component, HostListener} from '@angular/core';
import {faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import {Router} from '@angular/router';
import { NgZone } from '@angular/core';
import { AuthService, UserMeta } from "../../shared/services/auth.service"
import { OnExecuteData, ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { HttpClient } from  "@angular/common/http";
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { NotificationsService } from 'src/app/notifications/notifications.service';
var naclutil = require('tweetnacl-util');
import * as moment from 'moment'
import { UserInfo, Setting } from 'src/app/models/user.model'
import { PwaService } from 'src/app/pwa.service';
import { StellarService } from '../services/stellar-service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AlgoService } from 'src/app/system/algo.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { ReferralService } from 'src/app/referral/referral.service';
import { LogoutService } from 'src/app/shared/services/logout.service';
import { AdminService } from 'src/app/admin/admin.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  private server: any;
  userIcon = faUser;
  keyIcon  = faKey;
  loginForm: FormGroup;
  deferredPrompt; // Allows to show the install prompt
  setupButton;
  browserPlatform;
  iosguide: boolean = false;
  safariguide: boolean = false;
  firefoxguide: boolean = false;
  submitted = false;
  message: string;
  honeypot: any = "";

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  constructor(
    public authService: AuthService,
    public algoService: AlgoService,
    public noticeService: NoticeDataService,
    public stellarService: StellarService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private router: Router,    
    private recaptchaV3Service: ReCaptchaV3Service,
    public notificationsService: NotificationsService,
    public http: HttpClient,   
    public Pwa: PwaService,    
    private loadingService: LoadingService,
    private refService: ReferralService,
    private logoutService: LogoutService,
    private adminService: AdminService,
    private ngZone:NgZone) {
    	this.browserPlatform = this.Pwa.getBrowserPlatform();      
    }

  ngOnInit(): void {
    this.buildForm();    
    this.algoService.resetServiceData()
    this.authService.resetServiceData()
    this.stellarService.resetServiceData()
    this.noticeService.resetServiceData();
    this.refService.resetData();
      // // Add email for Intercom
      // (<any>window).Intercom('boot', {
      //   app_id: "v9vzre42",       
      // });

      this.logoutService.isSignout = false
  }

  buildForm(): void {
    this.loginForm = this.formBuilder.group({
      'email': ['', [
        //Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$/),
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
        ]
      ],
      'password': ['', [
        //Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$@$!%*#?&])([0-9A-Za-z$@$!%*#?&]+)$'),
       // Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!~@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!~@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
       Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?])([0-9A-Za-z!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?]+)$/), 
       Validators.minLength(8),
        Validators.maxLength(36)
      ]
    ],
    });

    //this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }
  formErrors = {
    'email': '',
    'password': ''
  };

  validationMessages = {
    'email': {
      'required':      'Email is required!',
      'pattern':       'Email must be valid!'
    },
    'password': {
      'required':      'Password is required!',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    }
  };

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.loginForm) { return; }
    const form = this.loginForm;
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

  // public handleRecaptchaExecute(data): void {
  //   console.log('this.handleToken(token)', data)
  // }

  get f() { return this.loginForm.controls; }

  loginClicked() {  
    if (!this.adminService.adminSetting.loginStatus)  {
      this.logoutService.show('')
      this.logoutService.signOut()
    }
    
    this.submitted = true;
    this.errorService.clearError()
    this.onValueChanged()     
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    if (this.honeypot) {
      return;
    }
   
    this.loadingService.show()
    // Execute recaptcha
    //console.log('start call recapcha:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
    this.recaptchaV3Service.execute('login')
    .subscribe(token => {
      // Verify token 
      axios.post(environment.api_url + 'api/v1/verifyrecapchatoken/'+this.email.value+"/login", {}, {
        headers: { Authorization: "Bearer " + token }
      }).then(response => {      
        if (response.data.status === 'success'){          
          this.http.post(`api/v1/accounts/login`, {email:this.email.value, password: this.password.value})                
          .subscribe(res => {  
            let data =  (res as any)             
            if (data.errCode === environment.SUCCESS) { 
              //console.log('user', data.user)  
                
              this.authService.ParseUserInfo(data.userBasicInfo)              
              this.authService.hash = this.password.value
              this.authService.userData = data.user
              this.authService.userData.token = data.token
              this.authService.userData.xlmPrice = data.userMeta.XlmP
              this.authService.userData.grxPrice = data.userMeta.GrxP
              this.authService.priceInfo.xlmgrx = data.userMeta.GrxP
              this.authService.priceInfo.xlmusd = data.userMeta.XlmP
              this.authService.userMetaStore = data.userMeta
              //this.authService.userMetaStore.ShouldReload = true              
              this.authService.userMetaStore.TokenExpiredTime = data.tokenExpiredTime
              
             

              this.loadingService.hide() 

              
              if (this.authService.userInfo.Tfa){                  
                  let curTime = new Date().getTime();
                  let tfaData = this.authService.GetLocalTfa(this.authService.userInfo.Uid)  
                              
                  if (tfaData && tfaData.Expire && this.authService.userInfo.Expire > 0 && curTime <= this.authService.userInfo.Expire &&                          
                      tfaData.Expire === this.authService.userInfo.Expire){ 
                    // Add email for Intercom
                    (<any>window).Intercom('boot', {
                      app_id: "v9vzre42",    
                      user_hash: this.authService.userData.Hmac,
                      email: this.authService.userData.Email,
                      name: this.authService.userData.Name,
                    });                     
                    this.router.navigate(['/dashboard/overview'])
                  } else {                      
                    this.router.navigate(['/two-factor'])
                  }
              } else {      
                // Add email for Intercom
                (<any>window).Intercom('boot', {
                  app_id: "v9vzre42",    
                  user_hash: this.authService.userData.Hmac,
                  email: this.authService.userData.Email,
                  name: this.authService.userData.Name,
                });                       
                this.router.navigate(['/dashboard/overview'])
              } 
                 
              if (this.authService.userInfo && this.authService.userData.PublicKey && this.authService.userInfo.LocalKey){
                if (this.authService.userInfo.EnSecretKey.length > 80){
                  this.stellarService.decryptSecretKey(this.password.value, {Salt: this.authService.userInfo.SecretKeySalt, EnSecretKey:this.authService.userInfo.EnSecretKey}, 
                    secretKey => {
                    if (secretKey != ''){
                      this.authService.secretKey = secretKey                      
                      this.stellarService.encryptSecretKey(this.authService.userInfo.LocalKey, secretKey, this.authService.userInfo.SecretKeySalt, (secretKeyBundle) => {                        
                        this.authService.userData.EnSecretKey = secretKeyBundle.EnSecretKey              
                        this.authService.SetLocalUserData()                        
                      })            
                    } else {
                      //console.log('GetSecretKey7')
                      //reject('')
                    }
                  })
                }                 
              }  
                               
            } else if ((res as any).errCode === environment.INVALID_UNAME_PASSWORD){
              this.showError('Invalid email or password!')                                 
            }  else if((res as any).errCode === environment.UNVERIFIED)  {    
              this.showError('Please verify your email before logging in.')                                
            }  else if((res as any).errCode === environment.IP_CONFIRM) {    
              this.showError('Please confirm your IP address via the link sent to your email.')                                
            }              
          },
          error => {              
            console.log(error)                       
            this.showError(null)                             
          })
        } else {                 
          this.showError(null)              
        }
      }).catch(err => { 
        this.showError(null)        
      })   
    },
    e => { // can not load recapcha     
      this.showError(null)
    });
  }

  showError(msg:string){
    this.loadingService.hide()
    if (!msg){
      this.errorService.handleError(null, 'Login attempt failed! Please retry.');
    } else {
      this.errorService.handleError(null, msg);
    }
    this.loginForm.reset()       
    this.submitted = false
  }

  private clientValidation() {
    if (!this.email || (this.email && !this.email.value)) {
      this.errorService.handleError(null, 'Please enter your email address.');
      return false;
    }
    if (!this.password || (this.password && !this.password.value)) {
      this.errorService.handleError(null, 'Please enter your password.');
      return false;
    }
    if (!this.errorService.isEmailAddressValid(this.email.value)) {
      this.errorService.handleError(null, 'Please enter a valid email address.');
      return false;
    }
    return true;
  }
  
  installApp() {
    if (this.browserPlatform == "iphone" || this.browserPlatform == "safari") {
      //console.log('iphone device show guide');
      this.iosguide = true;
    }
    else if (this.browserPlatform == "ipad") {
      //console.log('ipad device show guide');
      this.safariguide = true;
    }
    else {     
      this.Pwa.installApp();
    }
    /*else if (this.browserPlatform == "firefox")
      this.firefoxguide = true;*/

    /*// Show the prompt
    this.deferredPrompt.prompt();
    this.setupButton.disabled = true;
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
        .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA setup accepted');
                // hide our user interface that shows our A2HS button
                this.setupButton.style.display = 'none';
            } else {
                console.log('PWA setup rejected');
            }
            this.deferredPrompt = null;
        });*/
  }

  closeGuide() {
    if (this.iosguide || this.firefoxguide || this.safariguide) {
      this.iosguide = false; this.firefoxguide = false; this.safariguide = false;
    }
  }

  //@HostListener('window:beforeunload')
  ngOnDestroy():void {
  //   if (this.authService.userInfo && this.authService.userData.PublicKey && this.authService.userInfo.LocalKey){
  //     console.log('this.password.value', this.password.value)
  //     console.log('decryptSecretKey:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
  //     this.stellarService.decryptSecretKey(this.password.value, {Salt: this.authService.userInfo.SecretKeySalt, EnSecretKey:this.authService.userInfo.EnSecretKey}, 
  //       secretKey => {
  //         if (secretKey != ''){
  //           this.authService.secretKey = secretKey
  //           console.log('GetSecretKey6', secretKey)
  //           console.log('decryptSecretKey res:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
  //           this.stellarService.encryptSecretKey(this.authService.userInfo.LocalKey, this.stellarService.StringToSecretBytes(secretKey), this.authService.userInfo.SecretKeySalt, (secretKeyBundle) => {
  //             console.log('login-secretKeyBundle:', secretKeyBundle)
  //             this.authService.userData.EnSecretKey = secretKeyBundle.EnSecretKey              
  //             this.authService.SetLocalUserData()
  //             console.log('encryptSecretKey:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
  //           })            
  //         } else {
  //           console.log('GetSecretKey7')
  //           //reject('')
  //         }
  //       })
  //     }
  }
}
