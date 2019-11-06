import {Component} from '@angular/core';
import {faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import {Router} from '@angular/router';

import { NgZone } from '@angular/core';

import { AuthService } from "../../shared/services/auth.service"
import { OnExecuteData, ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from  "@angular/common/http";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { StellarService } from '../services/stellar-service';
import axios from 'axios';
import { NgxUiLoaderModule } from  'ngx-ui-loader';
import { environment } from '../../../environments/environment';
import { NotificationsService } from 'src/app/notifications/notifications.service';
var naclutil = require('tweetnacl-util');


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
    public authService: AuthService, private recaptchaV3Service: ReCaptchaV3Service,
    public notificationsService: NotificationsService,
    public http: HttpClient,
    private stellarService: StellarService,
    private spinnerService: NgxUiLoaderModule,
    private ngZone:NgZone) {}

  ngOnInit(): void {
    this.buildForm();    
    console.log('Init of login: ', this.authService.GetLocalUserData())
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
      'required':      'Email is required.',
      'pattern':         'Email must be a valid email'
    },
    'password': {
      'required':      'Password is required.',
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
  this.submitted = true;
  this.errorService.clearError()
  this.onValueChanged() 

  
  // stop here if form is invalid
  if (this.loginForm.invalid) {
    return;
  }
  
  // Execute recaptcha
  this.recaptchaV3Service.execute('login')
  .subscribe((token) => {
    // Verify token 
    axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/VerifyRecapchaToken', {}, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(response => {      
      if (response.data.status === 'success'){       
        this.ngZone.run(() => {          
          axios.post(`${environment.api_url}api/v1/users/login`, 
            {email:this.loginForm.value['email'], password: this.loginForm.value['password']})                
          .then(response => {                
            if (response.data.errCode === environment.SUCCESS) {
              this.authService.userData = response.data.user
              this.authService.userData.token = response.data.token                
              console.log('this.authService.userData:', this.authService.userData)
              this.authService.hash = this.loginForm.value['password'];
              this.authService.SetLocalUserData()
              console.log('userData:', this.authService.userData)

              this.notificationsService.publicNumberNotices([this.authService.userData.UrWallet,
                this.authService.userData.UrAlgo, this.authService.userData.UrGeneral])

              //this.spinnerService.stop()
              //store on local storage
              if (this.authService.userData.Tfa && this.authService.userData.Tfa.Enable 
                && this.authService.userData.Tfa.Enable === true){
                  //let d = new Date();
                  let t = new Date().getTime();
                  let tfaData = this.authService.GetLocalTfa(this.authService.userData.Uid)
                  console.log('Expire:', tfaData)
                  console.log('userData tfa:', this.authService.userData.Tfa)
                  if (this.authService.userData.Tfa.Expire && t <= this.authService.userData.Tfa.Expire && 
                      tfaData && tfaData.Expire && 
                      tfaData.Expire === this.authService.userData.Tfa.Expire){
                    //this.router.navigate(['/settings/profile'])
                    this.router.navigate(['/dashboard/overview'])
                  } else {
                    this.router.navigate(['/login/two-factor'])
                  }
              } else {
                this.router.navigate(['/dashboard/overview'])
              } 
            } else if (response.data.errCode === environment.INVALID_UNAME_PASSWORD){
              this.errorService.handleError(null, 'Invalid user name or password.') 
              this.loginForm.reset()
            }  else if(response.data.errCode === environment.UNVERIFIED)  {    
              this.errorService.handleError(null, 'Please verify your email before login.') 
              this.loginForm.reset()
            }  else if(response.data.errCode === environment.IP_CONFIRM) {    
              this.errorService.handleError(null, 'Please confirm your ip before login.') 
              this.loginForm.reset()
            } 
          })
          .catch(error => {
            //this.spinnerService.stop()
            console.log(error)                  
            this.errorService.handleError(null, 'Can not login now. Please try again later!')
            this.loginForm.reset()    
          });                 
        });  
         
      } else {
        //this.spinnerService.stop()
        this.errorService.handleError(null, 'Can not login, please try again later!');
        this.loginForm.reset()  
      }
    })
    .catch(err => {
      //this.spinnerService.stop()
      this.errorService.handleError(null, 'Can not login, please try again later!');
    })   
  });
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
