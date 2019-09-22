import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../../../settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {ErrorService} from '../../../../shared/error/error.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { environment } from 'src/environments/environment';
import {UserService} from '../../../../authorization/user.service';

@Component({
  selector: 'app-disable-two-fa',
  templateUrl: './disable-two-fa.component.html',
  styleUrls: ['./disable-two-fa.component.css']
})
export class DisableTwoFaComponent implements OnInit {

  @ViewChild('content') modal;
  disableForm: FormGroup;

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private authService: AuthService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.popupService.open(this.modal);
  }
  get code() { return this.disableForm.get('code'); }
  get password() { return this.disableForm.get('account_password'); }

  private initForm() {
    this.disableForm = this.formBuilder.group({
      'code': ['', Validators.required],
      'account_password': ['', Validators.required],
    });
  }

  private clientValidation() {
    if (!this.code || (this.code && !this.code.value)) {
      this.errorService.handleError(null, 'Please enter your code.');
      return false;
    }
    if (!this.password || (this.password && !this.password.value)) {
      this.errorService.handleError(null, 'Please enter account password.');
      return false;
    }
    return true;
  }

  disable2FA() {
    if (!this.clientValidation()) { return; }
    this.errorService.clearError();

   // let userData = this.authService.GetLocalUserData()
    this.authService.verifyTfaAuth(this.code.value, this.password.value, -1).then(res => {
      console.log('verifyTfaAuth-data: ', res)     
      if (res.data.valid === true ){       
        //userData.Tfa = {}
        this.authService.userData.Tfa = {}
        this.authService.SetLocalUserData()
        //this.authService.updateTfaData(userData.Tfa)     
        this.popupService.close()
        .then(() => {
          setTimeout(() => {
            this.snotifyService.simple('Two-factor authentication disabled.');
            this.userService.enable2FA(false);
            this.settingsService.sendTwoFAEnabledToObserver(false);
          }, 50);
        })
        .catch((error) => console.log(error));  

      } else {
        switch (res.data.errCode) {
          case environment.INVALID_UNAME_PASSWORD:
            this.errorService.handleError(null, 'The password is invalid.');
            break;
          case environment.TOKEN_INVALID:
              this.errorService.handleError(null, 'The onetime password is invalid.');
              break;
          default:
              this.errorService.handleError(null, 'Can not disable TFA right now. Please try again later.');
              break;
        }        
      }
    })

    
  }

}
