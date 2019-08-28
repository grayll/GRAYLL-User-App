import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsRoutingModule} from './settings.routing.module';
import {SettingsComponent} from './settings.component';
import {GoogleAuthenticatorComponent} from './security/two-FA-enable/google-authenticator/google-authenticator.component';
import {ScanQrCodeTwoFaComponent} from './security/two-FA-enable/scan-qr-code-two-fa/scan-qr-code-two-fa.component';
import {SaveBackupKeyTwoFaComponent} from './security/two-FA-enable/save-backup-key-two-fa/save-backup-key-two-fa.component';
import {EnableTwoFaLastStepComponent} from './security/two-FA-enable/enable-two-fa-last-step/enable-two-fa-last-step.component';
import {DisableTwoFaComponent} from './security/two-FA-enable/disable-two-fa/disable-two-fa.component';
import {ClipboardModule} from 'ngx-clipboard';
import {SharedModule} from '../shared/shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgbModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {PopupModule} from '../shared/popup/popup.module';
import {EnableMultisignatureComponent} from './security/multisignature-transactions/enable-multisignature/enable-multisignature.component';
import {DisableMultisignatureComponent} from './security/multisignature-transactions/disable-multisignature/disable-multisignature.component';
import {SecurityComponent} from './security/security.component';
import {WalletSettingsComponent} from './wallet-settings/wallet-settings.component';
import {NotificationsSettingsComponent} from './notifications-settings/notifications-settings.component';
import {MessagesSettingsComponent} from './messages-settings/messages-settings.component';
import {DisableAlgoNotificationsSettingsComponent} from './notifications-settings/disable-algo-notifications-settings/disable-algo-notifications-settings.component';
import {DisableWalletNotificationsSettingsComponent} from './notifications-settings/disable-wallet-notifications-settings/disable-wallet-notifications-settings.component';
import {DisableWalletMessagesComponent} from './messages-settings/disable-wallet-messages/disable-wallet-messages.component';
import {DisableAlgoMessagesComponent} from './messages-settings/disable-algo-messages/disable-algo-messages.component';
import {ProfileSettingsComponent} from './profile-settings/profile-settings.component';
import {EditFederationAddressComponent} from './edit-federation-address/edit-federation-address.component';
import {ChangeEmailAddressComponent} from './profile-settings/change-email-address/change-email-address.component';
import {ChangePasswordComponent} from './profile-settings/change-password/change-password.component';
import {ChangePhoneNumberComponent} from './profile-settings/change-phone-number/change-phone-number.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxFlagIconCssModule} from 'ngx-flag-icon-css';
import {VerifyPhoneNumberComponent} from './profile-settings/change-phone-number/verify-phone-number/verify-phone-number.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {DataSettingsComponent} from './data-settings/data-settings.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    SettingsComponent,
    GoogleAuthenticatorComponent,
    ScanQrCodeTwoFaComponent,
    SaveBackupKeyTwoFaComponent,
    EnableTwoFaLastStepComponent,
    DisableTwoFaComponent,
    EnableMultisignatureComponent,
    DisableMultisignatureComponent,
    SecurityComponent,
    WalletSettingsComponent,
    NotificationsSettingsComponent,
    MessagesSettingsComponent,
    DisableWalletNotificationsSettingsComponent,
    DisableAlgoNotificationsSettingsComponent,
    DisableWalletMessagesComponent,
    DisableAlgoMessagesComponent,
    ProfileSettingsComponent,
    EditFederationAddressComponent,
    ChangeEmailAddressComponent,
    ChangePasswordComponent,
    ChangePhoneNumberComponent,
    VerifyPhoneNumberComponent,
    DataSettingsComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    SettingsRoutingModule,
    ClipboardModule,
    SharedModule,
    NgbModule,
    PopupModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFlagIconCssModule,
    NgSelectModule,
    QRCodeModule,
  ]
})
export class SettingsModule { }
