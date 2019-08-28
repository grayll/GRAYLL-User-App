import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../../../settings.service';
import { AuthService } from "../../../../shared/services/auth.service"
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ErrorService} from '../../../../shared/error/error.service';

@Component({
  selector: 'app-enable-multisignature',
  templateUrl: './enable-multisignature.component.html',
  styleUrls: ['./enable-multisignature.component.css']
})
export class EnableMultisignatureComponent implements OnInit {

  @ViewChild('content') modal;

  enableMulSigForm: FormGroup
  errMsg : string

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
  ) { }

  ngOnInit() {
    console.log('init: uesrdata', this.authService.userData)
   // this.authService.GetLocalUserData()
    this.buildForm();

    this.popupService.open(this.modal);
  }
  buildForm(): void {    
    this.enableMulSigForm = this.formBuilder.group({
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
   onValueChanged(data?: any): boolean {
    //if (!this.enableTwoFA) { return; }
    const form = this.enableMulSigForm;
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
          this.errMsg = messages[key]
          return false
        }
      }
    }
    return true
  }
  
  formErrors = {     
    'oneTimePassword': '',
    'password': '',   
  };

  validationMessages = {   
    'oneTimePassword':{
      'required':      'oneTimePassword is required.',      
      'maxlength':      'oneTimePassword  must be 6 numbers long.',
      'pattern':        'oneTimePassword must be numbers.'
    },
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must be include at one letter and one number.',
      'minlength':     'Password must be at least 6 characters long.',
      'maxlength':     'Password cannot be more than 25 characters long.'
    },   
  };

  enable() {
    if (!(this.authService.userData.Tfa && this.authService.userData.Tfa.Enable && 
        this.authService.userData.Tfa.Enable == true)){
      this.errorService.handleError(null, 'Multisignature needs 2FA enable')
      return        
    }
    this.errorService.clearError()
    if (!this.onValueChanged()){
      this.errorService.handleError(null, this.errMsg)
      return
    }
    if (this.authService.userData.hash != this.enableMulSigForm.value['password']) {
      console.log('password not matched', this.authService.userData.hash)
      console.log('PASSWORD ', this.enableMulSigForm.value['password'])
      this.errorService.handleError(null, 'Password not match')
      return;
    }

    this.authService.verifyTfaAuth(this.enableMulSigForm.value['oneTimePassword'],  
        this.authService.userData.Tfa.TempSecret).subscribe(data => {           
      if (data.body['valid'] === true ){
        console.log('Verification succesully ') 
        this.authService.userData.UserSetting.MulSignature = true
        this.authService.UpdateSetting(this.authService.userData.Uid, this.authService.userData.UserSetting)
        console.log('userData: verifyTfaAuth: ', this.authService.userData)
       // this.settingsService.sendTwoFAEnabledToObserver(true);

       this.popupService.close()
       .then(() => {
         setTimeout(() => {
           this.snotifyService.simple('Multisignature transactions enabled.');
           this.settingsService.sendMultisignatureEnabledToObserver(true);
         }, 50);
       })
       .catch((error) => console.log(error));
       
      } else {        
        //this.authService.userData.Tfa = null    
       // this.errorMessage = "Can not enable TFA"
       this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
      }     
    }, err => {
      this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
    })
  }   

}
