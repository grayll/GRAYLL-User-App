import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../../../settings.service';
import { AuthService } from "../../../../shared/services/auth.service"
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ErrorService} from '../../../../shared/error/error.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-disable-multisignature',
  templateUrl: './disable-multisignature.component.html',
  styleUrls: ['./disable-multisignature.component.css']
})
export class DisableMultisignatureComponent implements OnInit {

  @ViewChild('content') modal;

  disableMulSigForm: FormGroup
  errMsg : string

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    
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
    this.disableMulSigForm = this.formBuilder.group({
      'oneTimePassword':  ['', 
        [Validators.required,         
        Validators.maxLength(6),
        Validators.pattern('^[0-9]+$')]],
      'password': ['', [
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?])([0-9A-Za-z!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?]+)$/),          
        Validators.minLength(8),
        Validators.maxLength(36)
       ]],  
      });

  }
   // Updates validation state on form changes.
   onValueChanged(data?: any): boolean {
    //if (!this.enableTwoFA) { return; }
    const form = this.disableMulSigForm;
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
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },   
  };

  disable() {
    // if (!(this.authService.userInfo.TfaEnable && this.authService.userInfo.TfaEnable === true)){
    //   this.errorService.handleError(null, 'Disable multi-signature needs 2FA enable')
    //   return        
    // }
    // if (!(this.authService.userData.Tfa && this.authService.userData.Tfa.Enable && 
    //     this.authService.userData.Tfa.Enable == true)){
    //   this.errorService.handleError(null, 'Disable multi-signature needs 2FA enable')
    //   return        
    // }
    this.errorService.clearError()
    if (!this.onValueChanged()){
      this.errorService.handleError(null, this.errMsg)
      return
    }
    if (this.authService.hash != this.disableMulSigForm.value['password']) {      
      this.errorService.handleError(null, 'Password not match')
      return;
    }

    this.authService.verifyTfaAuth(this.disableMulSigForm.value['oneTimePassword'],  
      this.disableMulSigForm.value['password'], 0).subscribe(res => {           
      if ((res as any).valid === true ){       
        
        this.authService.UpdateSetting("MulSignature", true).subscribe(res =>{
          this.authService.userInfo.Setting.MulSignature = true
          this.popupService.close()
          .then(() => {
            setTimeout(() => {
              this.snotifyService.simple('Multisignature transactions enabled.');
              //this.settingsService.sendMultisignatureEnabledToObserver(true);
            }, 50);
          })
        }),
        err =>{
          this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
        }                    
      } else {        
       switch ((res as any).errCode){
        case environment.TOKEN_INVALID:
          this.errorService.handleError(null, 'Your Two-factor authentication (2FA) is invalid. Please retry.')
          break;
        case environment.INVALID_UNAME_PASSWORD:
          this.errorService.handleError(null, 'Your password is invalid. Please retry.')
          break;
        default:
          this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
          break;
       }       
      }     
    }),
    err => {
      this.errorService.handleError(null, 'Your Two-factor authentication (2FA) is invalid. Please retry.')
    }
  }   

}
