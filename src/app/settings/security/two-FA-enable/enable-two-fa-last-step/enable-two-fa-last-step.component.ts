import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {Router} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../../../settings.service';
import {SharedService} from '../../../../shared/shared.service';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import {ErrorService} from '../../../../shared/error/error.service';
import { environment } from 'src/environments/environment.prod';
import {UserService} from '../../../../authorization/user.service';

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
    private ngZone:NgZone,
    private userService: UserService,
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
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
        Validators.minLength(8),
        Validators.maxLength(36)
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
      'maxlength':      'Backup key must be 16 characters long.',
      'pattern':  'Backup key must only contain characters A-Z and 0-9.'
    },
    'oneTimePassword':{
      'required':      '2FA code is required.',      
      'maxlength':      '2FA code must be 6 characters long.',
      'pattern':        '2FA code must only contain characters A-Z and 0-9.'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
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
    
    let bkKey: string = this.enableTwoFAForm.value['backupKey']
    if (userData.Tfa.BackupCode != bkKey) {
      this.errorService.handleError(null, 'Backup TwoFA key not match')
      console.log('backup Key not match')
      return;
    }

    // Verify one-time password
    console.log('this.authService.userData.Tfa-data: ', this.authService.userData.Tfa)
    let tmpUserData = this.authService.userData.Tfa
    tmpUserData.OneTimePassword = this.enableTwoFAForm.value['oneTimePassword']
    console.log('tmpUserData: ', tmpUserData)
    this.authService.updateTfaData(tmpUserData)
    .subscribe(res => {
      console.log('EnableTFA-data: ', res)     
      if ((res as any).errCode === environment.SUCCESS){
        console.log('Verification successful!') 
        this.authService.userData = userData
        this.authService.SetLocalUserData()
        this.authService.setTfa(true)
        //this.authService.userData.Tfa.Enable = true
        
        console.log('userData: verifyTfaAuth: ', this.authService.userData)
        this.authService.userInfo.Tfa = true
        // this.settingsService.sendTwoFAEnabledToObserver(true);
        // this.userService.enable2FA(true);
        this.popupService.close()
        .then(() => {
          setTimeout(() => {
            this.snotifyService.simple('Two-factor authentication enabled!');            
          }, 50);
        })
        .catch((error) => console.log(error));
      } else {
        switch ((res as any).errCode){
          case environment.TOKEN_INVALID:
            this.errorService.handleError(null, '2FA code is invalid! Please retry.')
            break;
          case environment.INTERNAL_ERROR:
              this.errorService.handleError(null, 'Two-factor authentication could not be enabled! Please retry.')
              break;
          case environment.INVALID_UNAME_PASSWORD:
              this.errorService.handleError(null, 'Invalid username or password!')
              break;
          default:
              this.errorService.handleError(null, 'Two-factor authentication could not be enabled! Please retry.')
              break;

        }
        this.authService.setTfa(false)        
      }     
    }),
    err => {
      this.errorService.handleError(null, '2FA code is invalid! Please retry.')
    }
  }
}


