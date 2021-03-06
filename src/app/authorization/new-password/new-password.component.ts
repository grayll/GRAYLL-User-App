import {Component, NgZone} from '@angular/core';
import {faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import axios from 'axios';
import {environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent {

  userIcon = faUser;
  keyIcon  = faKey;
  newPasswordForm: FormGroup;
  submitted = false;
  message: string;

  //get email() { return this.newPasswordForm.get('email'); }
  
  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private router: Router,
    public authService: AuthService, 
    private http: HttpClient,
    private ngZone:NgZone) { }

  ngOnInit(): void {
    this.buildForm();
    // this.subscription = this.recaptchaV3Service.onExecute
    // .subscribe((data: OnExecuteData) => {
    //   this.handleRecaptchaExecute(data);
    // });
  }

  buildForm(): void {
    this.newPasswordForm = this.formBuilder.group({
      'email': ['', [
        Validators.required,,
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),         
        ]
      ],     
    });

    //this.newPasswordForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // reset validation messages
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.newPasswordForm) { return; }
    const form = this.newPasswordForm;
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

 formErrors = {
    'email': ''    
  };

  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'pattern':         'Email must be a valid email'
    }
  };

  submitClicked() {
    this.submitted = true;
    this.onValueChanged()

    // stop here if form is invalid
    if (this.newPasswordForm.invalid) {
        return;
    }

    this.http.post(`${environment.api_url}api/v1/accounts/mailresetpassword`, 
      { email: this.newPasswordForm.value['email']})             
    .subscribe(res => {  
      if ((res as any).errCode == environment.INVALID_PARAMS)  {
        this.message = `Currently reset password can't be performed. Please try again later!`
        this.errorService.handleError(null, this.message)
        this.newPasswordForm.reset() 
      } else if((res as any).errCode == environment.EMAIL_NOT_EXIST ){
        this.message = "The email does not exist."
        this.errorService.handleError(null, this.message)
        this.newPasswordForm.reset() 
      } else {   
        this.newPasswordForm.reset()  
        this.message = 'A password reset link has been sent to your email.'
        this.errorService.handleError(null, this.message);
      }
    },
    error => {
      console.log(error) 
      this.newPasswordForm.reset()              
      this.message = 'Can not sent mail for password reset!'
      this.errorService.handleError(null, this.message);     
    })     
  } 

}


