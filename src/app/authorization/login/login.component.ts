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
        Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$@$!%*#?&])([0-9A-Za-z$@$!%*#?&]+)$'),
        Validators.minLength(8),
        Validators.maxLength(36)
      ]
    ],
    });

    //this.loginForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

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
    //console.log('token: ', token) 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token,       
      })
    };

    axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/VerifyRecapchaToken', {}, {
      headers: { Authorization: "Bearer " + token }
    })
    .then(response => {
      console.log(response)
      if (response.data.status === 'success'){
        // this.authService.SignIn(this.loginForm.value['email'], this.loginForm.value['password'])
        // .then(currentUser => {            
        //   if (currentUser.user && !currentUser.user.emailVerified){
        //     this.errorService.handleError(null, 'Please verify email before login')
        //     return
        //   }xcwLy8blSsMhyuzc8Aoz+vvc+dezqX+gbqssgCP0eiM=qYMG0HhOTuHOm1PFU6KZYevYz1pb0G0CitGJCpORQuI=
          // console.log('verify data:', currentUser)
          // currentUser.user.getIdToken(true).then(token => {
            this.ngZone.run(() => {
              //this.authService.userData = res.user
              //axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/GetUserData', {}, {
                axios.post('http://127.0.0.1:8888/api/v1/users/login', {email:this.loginForm.value['email'], password: this.loginForm.value['password']})
              .then(response => {    
                if (response.data.errCode &&  response.data.errCode == 9){
                  this.errorService.handleError(null, 'Invalid user name or password.') 
                  this.loginForm.reset()
                }  else if(response.data.errCode &&  response.data.errCode == 10)  {    
                  this.errorService.handleError(null, 'Please verify your email before login.') 
                  this.loginForm.reset()
                }  else if(response.data.errCode &&  response.data.errCode == 11)  {    
                  this.errorService.handleError(null, 'Please confirm your ip before login.') 
                  this.loginForm.reset()
                } else {    
                  this.authService.userData = response.data.user
                  this.authService.userData.token = response.data.token                
                
                  this.authService.userData.hash = this.loginForm.value['password'];
                  this.authService.SetLocalUserData()
                  //this.spinnerService.stop()
                  //store on local storage
                  if (this.authService.userData.Tfa && this.authService.userData.Tfa.Enable 
                    && this.authService.userData.Tfa.Enable === true){
                      //let d = new Date();
                      let t = new Date().getTime();
                      let tfaData = this.authService.GetLocalTfa()
                      if (this.authService.userData.Tfa.Exp && t <= this.authService.userData.Tfa.Exp && 
                          tfaData && tfaData.expire && 
                          tfaData.expire === this.authService.userData.Tfa.Exp){
                        this.router.navigate(['/settings/profile'])
                      } else {
                        this.router.navigate(['/login/two-factor'])
                      }
                  } else {
                    this.router.navigate(['/settings/profile'])
                  } 
                }
              })
              .catch(error => {
                //this.spinnerService.stop()
                console.log(error)                  
                this.errorService.handleError(null, 'Can not login now. Please try again later!')
                this.loginForm.reset()    
              });                 
            });  
          //})                    
        // },
        // err => {
        //   //this.spinnerService.stop()
        //   this.errorService.handleError(null, 'Invalid user name or password')            
        // })     
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