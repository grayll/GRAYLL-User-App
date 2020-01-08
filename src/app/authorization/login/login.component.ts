import {Component} from '@angular/core';
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
  submitted = false;
  message: string;
  

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private router: Router,
    public authService: AuthService, 
    private recaptchaV3Service: ReCaptchaV3Service,
    public notificationsService: NotificationsService,
    public http: HttpClient,   
    private ngZone:NgZone) {}

  ngOnInit(): void {
    this.buildForm();    
    //console.log('Init of login: ', this.authService.GetLocalUserData())
  }

  buildForm(): void {
    this.loginForm = this.formBuilder.group({
      'email': ['', [
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Validators.required,
          //Validators.email
        ]
      ],
      'password': ['', [
        //Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$@$!%*#?&])([0-9A-Za-z$@$!%*#?&]+)$'),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
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

  public handleRecaptchaExecute(data): void {
    console.log('this.handleToken(token)', data)
  }

  get f() { return this.loginForm.controls; }

  loginClicked() {    
    if (this.submitted){
      return
    }
    this.errorService.clearError()
    this.onValueChanged()     
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.submitted = true;
    
    // Execute recaptcha
    //console.log('start call recapcha:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
    this.recaptchaV3Service.execute('login')
    .subscribe((token) => {
      // Verify token 
      axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/VerifyRecapchaToken', {}, {
        headers: { Authorization: "Bearer " + token }
      })
      .then(response => {      
        if (response.data.status === 'success'){    
          //console.log('recapcha resp:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
          this.ngZone.run(() => {     
            //console.log('login start:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS')) 
            this.http.post(`api/v1/accounts/login`, 
              {email:this.loginForm.value['email'], password: this.loginForm.value['password']})                
            .subscribe(res => {  
              let data =  (res as any)             
              if (data.errCode === environment.SUCCESS) {
                //console.log('login resp:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
                this.authService.ParseUserInfo(data.userBasicInfo)
                
                this.authService.userData = data.user
                this.authService.userData.token = data.token
                this.authService.userData.tokenExpiredTime = data.tokenExpiredTime
                // if (!this.authService.userData.OpenOrders){
                //   this.authService.userData.OpenOrders = 0
                // }
                // if (!this.authService.userData.OpenOrdersXLM){
                //   this.authService.userData.OpenOrdersXLM = 0
                // }
                // if (!this.authService.userData.OpenOrdersGRX){
                //   this.authService.userData.OpenOrdersGRX = 0
                // }
                //console.log('login-OpenOrders', this.authService.userData)
                this.authService.hash = this.loginForm.value['password'];
                this.authService.SetLocalUserData()
                               
                //store on local storage
                if (this.authService.userInfo.Tfa){
                    //let d = new Date();
                    let curTime = new Date().getTime();
                    let tfaData = this.authService.GetLocalTfa(this.authService.userInfo.Uid)                    
                    if (tfaData && tfaData.Expire && this.authService.userInfo.Expire > 0 && curTime <= this.authService.userInfo.Expire &&                          
                        tfaData.Expire === this.authService.userInfo.Expire){                      
                      this.router.navigate(['/dashboard/overview'])
                    } else {
                      this.router.navigate(['/login/two-factor'])
                    }
                } else {
                  this.router.navigate(['/dashboard/overview'])
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
          });  
          
        } else {          
          this.showError(null)
              
        }
      })
      .catch(err => {        
        this.showError(null)        
      })   
    });
  }

  showError(msg:string){
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

  loginClicked1() {
    if (!this.clientValidation()) { return; }
    this.errorService.clearError();
    this.router.navigate(['/login/two-factor']);
  }

}
