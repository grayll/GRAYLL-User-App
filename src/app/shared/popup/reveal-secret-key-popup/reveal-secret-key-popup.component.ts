import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';

@Component({
  selector: 'app-reveal-secret-key-popup',
  templateUrl: './reveal-secret-key-popup.component.html',
  styleUrls: ['./reveal-secret-key-popup.component.css']
})
export class RevealSecretKeyPopupComponent implements OnInit {

  @ViewChild('content') modal;
  didContinue: boolean;
  verifyingBy2FA: boolean;
  code: string;

  private user: UserModel;

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService
  ) {
    this.user = this.userService.getUser();
    this.verifyingBy2FA = this.user.is2FAEnabled;
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  submit() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      this.popupService.close().then(() => {
        this.settingsService.sendConfirmAuthorityToObserver(true);
      });
    }
  }

  clientValidation(): boolean {
    if (!this.code || this.code === '') {
      this.errorService.handleError(null, 'Please enter your ' + (this.verifyingBy2FA ? '2FA code' : 'password') + '.');
      return false;
    }
    return true;
  }

}
