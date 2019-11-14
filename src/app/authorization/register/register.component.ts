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
import {environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient,
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
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
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
  
  let pair = this.stellarService.generateKeyPair();
    this.stellarService.encryptSecretKey(this.registerForm.value['password'], pair.rawSecretKey(), (encryptedSecret) => {    
      this.stellarService.hashPassword(this.registerForm.value['password'], hash => {
        const setting: Setting = {IpConfirm:true}
        let userData = {
          //Token:token,
          //Uid: res.user.uid,
          Email: this.registerForm.value['email'],
          HashPassword: this.registerForm.value['password'],
          Name: this.registerForm.value['name'],  
          LName: this.registerForm.value['lname'],  
          Setting: setting,
          //PublicKey: pair.publicKey(),              
          //EncryptedSecretKey: encryptedSecret.EncryptedSecretKey,
          //SecretKeySalt: encryptedSecret.Salt,
        }
        console.log(userData)      
        
        this.http.post(`api/v1/accounts/register`, userData)             
        .subscribe(res => {  
          if ((res as any).errCode == environment.EMAIL_IN_USED)  {
            let content = "The email entered is already registered."
            this.errorService.handleError(null, content)
            this.registerForm.reset() 
          } else {    
            this.ngZone.run(() => {                    
              this.router.navigate(['/login/confirm-email'], { state: { email: this.registerForm.value['email'],
                name: this.registerForm.value['name']}})
            }) 
          }
        }),
        error => {
          console.log(error) 
          this.registerForm.reset()              
          this.errorService.handleError(null, 'Can not register now. Please try again later!')     
        }; 
      })    
    })        
  }
}


