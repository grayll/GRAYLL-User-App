import {Component} from '@angular/core';
import {faKey, faUser} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import {Router} from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import axios from 'axios';

@Component({
  selector: 'app-two-factor',
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css']
})
export class TwoFactorComponent {

  userIcon = faUser;
  keyIcon  = faKey;
  formgrp: FormGroup;

  get code() { return this.formgrp.value['code']; }
  get dontAskForNext30Days() { return this.formgrp.value['dontAskForNext30Days']; }

  constructor(
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initForm();
  }

  private initForm() {
    this.formgrp = this.formBuilder.group({
      'code': ['', Validators.required],
      'dontAskForNext30Days': [false, Validators.required],
    });
  }
  formErrors = {   
    'code':'',
    'dontAskForNext30Days': '',      
  };

  validationMessages = {        
    'code':{
      'required':      '2FA code from your Authenticator App is required.',
     
    },
    'dontAskForNext30Days':{
      'required':      'dontAskForNext30Days is required.',
     
    }  
  };
 // Updates validation state on form changes.
 onValueChanged(data?: any) {
  //if (!this.enableTwoFA) { return; }
  const form = this.formgrp;
  for (const field in this.formErrors) {
    // clear previous error message (if any)
    this.formErrors[field] = '';
    const control = form.get(field);    
    //console.log('control:', control)  
    if (control && control.invalid) {
      
      const messages = this.validationMessages[field];
            
      for (const key in control.errors) {
        this.formErrors[field] += messages[key] + ' ';
      }
    }
  }
}
  private clientValidation() {
    if (this.formgrp.invalid) {
      this.errorService.handleError(null, 'Please enter the 2FA code from your Authenticator App.');
      return false;
    }
    return true;
  }

  loginClicked() {
    this.onValueChanged()
    if (!this.clientValidation()) { return; }
    this.errorService.clearError();
    let exp = 0
    if (this.dontAskForNext30Days){
      console.log('Do not ask for the next 30 days.')          
      let t = new Date().getTime();
      exp = t + 1000 * 60 * 60 * 24 * 30
    }

    //let userData = this.authService.userData
    this.authService.verifyTfaAuth(this.code, this.authService.userData.Tfa.Secret, exp)
    .subscribe(res => {
      console.log('verifyTfaAuth-data: ', res)     
      if ((res as any).valid === true ){
        //this.router.navigate(['/settings/profile'])
        this.router.navigate(['/dashboard/overview'])
        if (this.dontAskForNext30Days){
          console.log('Do not ask for the next 30 days.')          
          this.authService.userInfo.Expire = exp
          // this.authService.userData = userData
          // this.authService.SetLocalUserData()
          this.authService.SetLocalTfa(this.authService.userInfo.Uid, {Expire:exp})
          //this.authService.updateTfaData(userData)
          console.log('set 30day tfa')
        }
      } else {
        this.errorService.handleError(null, 'The 2FA code from your Authenticator App is invalid! Please retry.');
      }
    }),
    err => {
      this.errorService.handleError(null, 'The 2FA code from your Authenticator App is invalid! Please retry.');
    }
    
  }

}
