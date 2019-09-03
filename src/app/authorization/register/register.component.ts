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
//var naclutil = require('tweetnacl-util');
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
     // 'agree': ['', [Validators.required]],
      'name': ['', [Validators.required, Validators.minLength(3),
        Validators.maxLength(50)]],      
      'email': ['', [
          Validators.required,
          Validators.email
        ]
      ],
      'password': ['', [
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
          Validators.minLength(6),
          Validators.maxLength(25)
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
      console.log('control:', control)  
      if (control && control.invalid) {
        
        const messages = this.validationMessages[field];
        console.log('control invalid:', control, messages)  
        
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
   
    'name':'',
    'email': '',
    'password': '',
    //'confirmPassword': ''
  };

  validationMessages = {
        
    'name':{
      'required':      'Name is required.',
      'minlength':      'Name must be at least 3 characters long.',
      'maxlength':      'Name cannot be more than 25 characters long.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email must be a valid email'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must be include at one letter and one number.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 25 characters long.'
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

  this.authService.SignUp(this.registerForm.value['email'], this.registerForm.value['password']).then( res =>{
    console.log(res)
    // Send email to usesr for verification.
    this.authService.SendVerificationMail().then(()=> {
      this.ngZone.run(() => {
        // set user data
        
        res.user.getIdToken(true).then( token => {
          // Generate key/pair
          let pair = this.stellarService.generateKeyPair();
          this.stellarService.encryptSecretKey(this.registerForm.value['password'], pair.rawSecretKey(), (encryptedSecret) => {
            const userSetting: Setting = {IpConfirm:true}
            let userData = {
              Uid: res.user.uid,
              Email: this.registerForm.value['email'],
              Name: this.registerForm.value['name'],  
              Setting: userSetting,
              Address: pair.publicKey(),
              Federation: this.registerForm.value['email']+'*grayll.io',
              SecretKey: encryptedSecret,
            }
                       
            axios.post('https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/AddUserData', userData)
            .then(response => {
              console.log(response)
              this.errorService.handleError(null, 'Register successfully. Please check your email to verify!') 
            })
            .catch( error => {
              console.log(error)              
              this.errorService.handleError(null, 'Can not register now. Please try again later!')     
            }); 
          
          })

          // Need to call clound function to udpate and set ip
          
          // const user: User = {
          //   Uid: res.user.uid,
          //   Email: this.registerForm.value['email'],
          //   Name: this.registerForm.value['name'],
          //   Setting: userSetting,
          //   Token: token,
          // }
          
        })               
      })
    }).catch(err => {
      console.log('err verify mail: ', err)
      this.errorService.handleError(null, err.message)
    })
  }).catch(err => {
    console.log('error register:', err)
    //this.formErrors.password = err.message
    if (err.code === 'auth/email-already-in-use'){
      this.errorService.handleError(null, err.message)
    }
  }) 
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
