import {Component, OnInit, NgZone} from '@angular/core';
import {faEnvelope, faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';

import { Router } from '@angular/router';
import { AuthService } from "../../shared/services/auth.service"
import { User, Setting } from "../../shared/services/user";
import { StellarService } from '../services/stellar-service';
import axios from 'axios';
import { NgxUiLoaderModule } from  'ngx-ui-loader';
import * as naclutil from 'tweetnacl-util'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  submitted = false;
  userIcon = faUser;
  emailIcon = faEnvelope;
  keyIcon  = faKey;
  registerForm: FormGroup;
  message: string;
  // get name() { return this.registerForm.get('name') }
  // get email() { return this.registerForm.get('email'); }
  // get password() { return this.registerForm.get('password'); }

  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private router: Router, public authService: AuthService,
    private stellarService: StellarService,
    private ngZone:NgZone,
  ) {
   
  }

  ngOnInit() {
    this.buildForm()  
  }

  buildForm(): void {    
    this.registerForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(3),
        Validators.maxLength(50)]],   
      'lname': ['', [Validators.required, Validators.minLength(3),
        Validators.maxLength(50)]],      
      'email': ['', [
          Validators.required,
          Validators.email
        ]
      ],
      'password': ['', [
          //Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$@$!%*#?&])([0-9A-Za-z$@$!%*#?&]+)$'),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?]+)$/),          
          Validators.minLength(8),
          Validators.maxLength(36)
       ]
      ],  
      });
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.registerForm) { return; }
    const form = this.registerForm;
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
    'name':'',
    'lname':'',
    'email': '',
    'password': '',    
  };

  validationMessages = {  
    'name':{
      'required':      'First Name is required.',
      'minlength':      'First Name must be at least 3 characters long.',
      'maxlength':      'First Name cannot be more than 25 characters long.'
    },      
    'lname':{
      'required':      'Last Name is required.',
      'minlength':      'Last Name must be at least 3 characters long.',
      'maxlength':      'Last Name cannot be more than 25 characters long.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email must be a valid email'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },    
  };

get f() { return this.registerForm.controls; }

registerClicked() {
  this.submitted = true;
  this.errorService.clearError();
  this.onValueChanged()
  // stop here if form is invalid
  if (this.registerForm.invalid) {
      console.log('form invalid')
      return;
  }

  // this.authService.SignUp(this.registerForm.value['email'], this.registerForm.value['password']).then( res =>{
  //   console.log(res)
  //   // Send email to usesr for verification.
  //   this.authService.SendVerificationMail().then(()=> {
  //     this.ngZone.run(() => {
  //       // set user data        
  //       res.user.getIdToken(true).then( token => {
          // Generate key/pair
          let pair = this.stellarService.generateKeyPair();
          this.stellarService.encryptSecretKey(this.registerForm.value['password'], pair.rawSecretKey(), (encryptedSecret) => {
            
            this.stellarService.hashPassword(this.registerForm.value['password'], hash => {
              const userSetting: Setting = {IpConfirm:true}
              let userData = {
                //Token:token,
                //Uid: res.user.uid,
                Email: this.registerForm.value['email'],
                HashPassword: this.registerForm.value['password'],
                Name: this.registerForm.value['name'],  
                LName: this.registerForm.value['lname'],  
                UserSetting: userSetting,
                PublicKey: pair.publicKey(),              
                EncryptedSecretKey: encryptedSecret.EncryptedSecretKey,
                SecretKeySalt: encryptedSecret.Salt,
              }
              console.log(userData)      
              //axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/AddUserData', userData, {
              axios.post('https://grayll-app-bqqlgbdjbq-uc.a.run.app/api/v1/users/register', userData, {
                headers: {
                    'Content-Type': 'application/json',
                }
              })             
              .then(response => {  
                if (response.data.errCode == 8)  {
                  let content = "Email address already in used"
                  this.errorService.handleError(null, content)
                  this.registerForm.reset() 
                } else {    
                  this.ngZone.run(() => {                    
                    this.router.navigate(['/login/confirm-email'], { state: { email: this.registerForm.value['email'],
                      name: this.registerForm.value['name']}})
                  })      
                  
                // this.errorService.handleError(null, 
                //   'Registration is almost completed! We have sent an email to ' + this.registerForm.value['email'] + ' to verify your account.') 
                // }
                // this.registerForm.reset() 
                }
              })
              .catch( error => {
                console.log(error) 
                this.registerForm.reset()              
                this.errorService.handleError(null, 'Can not register now. Please try again later!')     
              }); 
            })    
          })

          // Need to call clound function to udpate and set ip
          
          // const user: User = {
          //   Uid: res.user.uid,
          //   Email: this.registerForm.value['email'],
          //   Name: this.registerForm.value['name'],
          //   Setting: userSetting,
          //   Token: token,
          // }
          
  //      })               
  //    })
  //   }).catch(err => {
  //     this.registerForm.reset() 
  //     console.log('err verify mail: ', err)
  //     this.errorService.handleError(null, err.message)
  //   })
  // }).catch(err => {
  //   this.registerForm.reset() 
  //   console.log('error register:', err)
  //   //this.formErrors.password = err.message
  //   if (err.code === 'auth/email-already-in-use'){
  //     this.errorService.handleError(null, err.message)
  //   }
  // }) 
}
}

// export class RegisterComponent {

//   userIcon = faUser;
//   emailIcon = faEnvelope;
//   keyIcon  = faKey;
//   registerForm: FormGroup;

//   get name() { return this.registerForm.get('name') }
//   get email() { return this.registerForm.get('email'); }
//   get password() { return this.registerForm.get('password'); }

//   constructor(
//     private formBuilder: FormBuilder,
//     private errorService: ErrorService
//   ) {
//     this.initForm();
//   }

//   private initForm() {
//     this.registerForm = this.formBuilder.group({
//       name: [null, Validators.required],
//       email: [null, [Validators.required, Validators.email]],
//       password: [null, Validators.required]
//     });
//   }

//   private clientValidation() {
//     if (!this.name || (this.name && !this.name.value)) {
//       this.errorService.handleError(null, 'Please enter your name.');
//       return false;
//     }
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

//   registerClicked() {
//     if (!this.clientValidation()) { return; }
//     this.errorService.clearError();
//     alert('Frontend validation passed.');
//   }

// }
