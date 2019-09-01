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
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)
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
      'pattern':       'Password must include at one letter and one number.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 25 characters long.',
    }
  };

get f() { return this.loginForm.controls; }

loginClicked() {
  this.submitted = true;
  this.errorService.clearError()
  this.onValueChanged() 

  //this.spinnerService.start();

  // let pair = this.stellarService.generateKeyPairNacl()
  // //console.log('secret: ', pair.secretKey)
  // this.stellarService.encryptSecretKey('some password', pair.secretKey, (encryptedSecretKeyBundle) => {
  //     console.log('TODO: save the following JSON object');
  //     console.log(JSON.stringify(encryptedSecretKeyBundle));
  //     //endStage();
  //     const stage1 = 'Decrypting the encrypted key';
  //     //printStage(stage1);
  //     this.stellarService.decryptSecretKey('some password', encryptedSecretKeyBundle, (secretKey) => {
  //       console.log(secretKey);
  //     });
  //   });
  
  //   this.stellarService.hashPassword(this.loginForm.value['password'], hash =>{
  //     console.log('hashpass: ', hash)

  //     this.stellarService.verifyPassword(hash+'gh', this.loginForm.value['password'], (isvalid) =>{
  //       console.log('isvalid:', isvalid)
  //     })
  //   })

  let pair = this.stellarService.generateKeyPair()
  //let rawpk = pair.rawPublicKey()
  var pk = Uint8Array.from(pair.rawPublicKey())
  var sec = Uint8Array.from(pair.rawSecretKey())
  console.log('bytes sec:', sec)
  console.log('sec:', naclutil.encodeBase64(sec))
  console.log('PublicKey:', pair.publicKey)

  this.stellarService.encryptSecretKey(this.loginForm.value['password'], pair.rawSecretKey(), (encryptedBundle) =>{
    console.log('encrypted sec:', encryptedBundle)

    this.stellarService.decryptSecretKey(this.loginForm.value['password'], encryptedBundle, rawSec => {
      console.log('decrypted sec bytes:', rawSec)
      console.log('decrypted sec:', this.stellarService.ToBase64(rawSec))
      console.log('decrypted sec string:', this.stellarService.SecretBytesToString(rawSec))
    })
  })

  //this.stellarService.server.
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
        this.authService.SignIn(this.loginForm.value['email'], this.loginForm.value['password'])
        .then(currentUser => {            
          if (currentUser.user && !currentUser.user.emailVerified){
            this.errorService.handleError(null, 'Please verify email before login')
            return
          }
          console.log('verify data:', currentUser)
          currentUser.user.getIdToken(true).then(token => {
            this.ngZone.run(() => {
              //this.authService.userData = res.user
              axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/GetUserData', {}, {
                headers: { Authorization: "Bearer " + token }
              })
              .then(response => {
                
                this.authService.userData = response.data.User
                this.authService.userData.token = token
                                
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
              })
              .catch(error => {
                //this.spinnerService.stop()
                console.log(error)                  
                this.errorService.handleError(null, 'Can not register now. Please try again later!')    
              });                 
            });  
          })                    
        },
        err => {
          //this.spinnerService.stop()
          this.errorService.handleError(null, 'Invalid user name or password')            
        })     
      } else {
        //this.spinnerService.stop()
        this.errorService.handleError(null, 'Can not login, please try again later!');
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

// export class LoginComponent {

//   userIcon = faUser;
//   keyIcon  = faKey;
//   loginForm: FormGroup;

//   get email() { return this.loginForm.get('email'); }
//   get password() { return this.loginForm.get('password'); }

//   constructor(
//     private formBuilder: FormBuilder,
//     private errorService: ErrorService,
//     private router: Router
//   ) {
//     this.initForm();
//   }

//   private initForm() {
//     this.loginForm = this.formBuilder.group({
//       email: [null, [Validators.required, Validators.email]],
//       password: [null, Validators.required]
//     });
//   }

//   private clientValidation() {
//     if (!this.email || (this.email && !this.email.value)) {
//       this.errorService.handleError(null, 'Please enter your email address.');
//       return false;
//     }
//     if (!this.password || (this.password && !this.password.value)) {
//       this.errorService.handleError(null, 'Please enter your password.');
//       return false;
//     }
//     if (!this.errorService.isEmailAddressValid(this.email.value)) {
//       this.errorService.handleError(null, 'Please enter a valid email address.');
//       return false;
//     }
//     return true;
//   }

//   loginClicked() {
//     if (!this.clientValidation()) { return; }
//     this.errorService.clearError();
//     this.router.navigate(['/login/two-factor']);
//   }

// }