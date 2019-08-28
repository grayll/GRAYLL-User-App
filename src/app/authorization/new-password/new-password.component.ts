import {Component, NgZone} from '@angular/core';
import {faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';

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

  get email() { return this.newPasswordForm.get('email'); }
  
  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private router: Router,
    public authService: AuthService, 
    
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
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Validators.required,
          //Validators.email
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

  public handleRecaptchaExecute(data): void {
    console.log('this.handleToken(token)', data)
  }

 formErrors = {
    'email': ''    
  };

  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'pattern':         'Email must be a valid email'
    }
  };

get f() { return this.newPasswordForm.controls; }

submitClicked() {
  this.submitted = true;
  this.onValueChanged()

  // stop here if form is invalid
  if (this.newPasswordForm.invalid) {
      return;
  }

  this.authService.ForgotPassword(this.newPasswordForm.value['email']).then(
    data => {
      this.message = 'We have sent password reset to your email!'
      this.errorService.handleError(null, this.message);
    }, err => {
      this.message = 'Can not sent mail for password reset!'
      this.errorService.handleError(null, this.message);
    }

    

  )
    
} 

}


