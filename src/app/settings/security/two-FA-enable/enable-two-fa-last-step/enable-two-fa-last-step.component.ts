import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {Router} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../../../settings.service';
import {SharedService} from '../../../../shared/shared.service';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import {ErrorService} from '../../../../shared/error/error.service';
import * as argon2 from "argon2";

@Component({
  selector: 'app-enable-two-fa-last-step',
  templateUrl: './enable-two-fa-last-step.component.html',
  styleUrls: ['./enable-two-fa-last-step.component.css']
})
export class EnableTwoFaLastStepComponent implements OnInit {

  @ViewChild('content') modal;

  enableTwoFAForm: FormGroup;
  submitted: boolean;

  constructor(
    public popupService: PopupService,
    private router: Router,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private authService: AuthService,
    private ngZone:NgZone
  ) { }
  buildForm(): void {    
    this.enableTwoFAForm = this.formBuilder.group({
     
      'backupKey': ['', 
      [Validators.required, 
        Validators.maxLength(16),        
        Validators.pattern('^[A-Z0-9]+$')]],      
      'oneTimePassword':  ['', 
        [Validators.required,         
        Validators.maxLength(6),
        Validators.pattern('^[0-9]+$')]],
      'password': ['', [
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
          Validators.minLength(6),
          Validators.maxLength(25)
       ]],  
      });

  }
   // Updates validation state on form changes.
   onValueChanged(data?: any) {
    //if (!this.enableTwoFA) { return; }
    const form = this.enableTwoFAForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      //console.log('control:', control)  
      if (control && control.invalid) {
        
        const messages = this.validationMessages[field];
        //console.log('control invalid:', control, messages)  
        
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }
  ngOnInit() {
    this.buildForm();
    this.popupService.open(this.modal);    
  }

  formErrors = {   
    'backupKey':'',
    'oneTimePassword': '',
    'password': '',   
  };

  validationMessages = {        
    'backupKey':{
      'required':      'Backup key is required.',     
      'maxlength':      'Backup key  must be 16 characters long',
      'pattern':  'Backup key must be characters [A-Z0-9]'
    },
    'oneTimePassword':{
      'required':      'oneTimePassword is required.',      
      'maxlength':      'oneTimePassword  must be 6 characters long',
      'pattern':        'oneTimePassword must be characters [A-Z0-9]'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must be include at one letter and one number.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 25 characters long.'
    },   
  };

  back() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/settings/profile', {outlets: {popup: 'save-backup-key'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }

  async enable2FA() {
    this.submitted = true;
    this.onValueChanged()
    if (this.enableTwoFAForm.invalid) {
      console.log('form invalid')
      return;
    }

    let userData = this.authService.GetLocalUserData();
    console.log('userData:', userData)
    console.log('bk key:', this.enableTwoFAForm.value['backupKey'])
    
    //Synchronous    
    //const isEqual = await argon2.verify(userData.hash, this.enableTwoFA.value['password']); // returns true

    if (userData.hash != this.enableTwoFAForm.value['password']) {
      console.log('password not matched', userData.hash)
      console.log('PASSWORD ', this.enableTwoFAForm.value['password'])
      this.errorService.handleError(null, 'Password not match')
      return;
    }
    let bkKey: string = this.enableTwoFAForm.value['backupKey']
    if (userData.Tfa.BackupCode != bkKey) {
      this.errorService.handleError(null, 'Backup TwoFA key not match')
      console.log('backup Key not match')
      return;
    }

    // Verify one-time password
    console.log('this.authService.userData.Tfa-data: ', this.authService.userData.Tfa)
    this.authService.verifyTfaAuth(this.enableTwoFAForm.value['oneTimePassword'],  
        this.authService.userData.Tfa.TempSecret).subscribe(data => {
      console.log('EnableTFA-data: ', data)
     
      if (data.body['valid'] === true ){
        console.log('Verification succesully ') 
        this.authService.userData = userData
        this.authService.SetLocalUserData()
        this.authService.setTfa(true)
        this.authService.userData.Tfa.Enable = true
        this.authService.UpdateTfaData(this.authService.userData)
        console.log('userData: verifyTfaAuth: ', this.authService.userData)
        this.settingsService.sendTwoFAEnabledToObserver(true);

        this.popupService.close()
        .then(() => {
          setTimeout(() => {
            this.snotifyService.simple('Two-factor authentication enabled.');            
          }, 50);
        })
        .catch((error) => console.log(error));
      } else {
        this.authService.setTfa(false)
        //this.authService.userData.Tfa = null    
       // this.errorMessage = "Can not enable TFA"
       this.errorService.handleError(null, 'Can not enable TFA. Please try again later!')
      }     
    }, err => {
      this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
    })
  }
}


