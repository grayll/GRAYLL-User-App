import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {SettingsComponent} from './settings.component';
import {GoogleAuthenticatorComponent} from './security/two-FA-enable/google-authenticator/google-authenticator.component';
import {ScanQrCodeTwoFaComponent} from './security/two-FA-enable/scan-qr-code-two-fa/scan-qr-code-two-fa.component';
import {SaveBackupKeyTwoFaComponent} from './security/two-FA-enable/save-backup-key-two-fa/save-backup-key-two-fa.component';
import {EnableTwoFaLastStepComponent} from './security/two-FA-enable/enable-two-fa-last-step/enable-two-fa-last-step.component';
import {DisableTwoFaComponent} from './security/two-FA-enable/disable-two-fa/disable-two-fa.component';
import {DisableMultisignatureComponent} from './security/multisignature-transactions/disable-multisignature/disable-multisignature.component';
import {EnableMultisignatureComponent} from './security/multisignature-transactions/enable-multisignature/enable-multisignature.component';
import {DisableWalletNotificationsSettingsComponent} from './notifications-settings/disable-wallet-notifications-settings/disable-wallet-notifications-settings.component';
import {DisableAlgoNotificationsSettingsComponent} from './notifications-settings/disable-algo-notifications-settings/disable-algo-notifications-settings.component';
import {DisableWalletMessagesComponent} from './messages-settings/disable-wallet-messages/disable-wallet-messages.component';
import {DisableAlgoMessagesComponent} from './messages-settings/disable-algo-messages/disable-algo-messages.component';
import {EditFederationAddressComponent} from './edit-federation-address/edit-federation-address.component';
import {ChangePasswordComponent} from './profile-settings/change-password/change-password.component';
import {ChangeEmailAddressComponent} from './profile-settings/change-email-address/change-email-address.component';
import {ChangePhoneNumberComponent} from './profile-settings/change-phone-number/change-phone-number.component';
import {VerifyPhoneNumberComponent} from './profile-settings/change-phone-number/verify-phone-number/verify-phone-number.component';
import { SecureInnerPagesGuard } from '../shared/guard/secure-inner-pages.guard';
import { AuthGuard } from '../shared/guard/auth.guard';

const popupRoutes: Routes = [
  {
    path: 'google-authenticator',
    component: GoogleAuthenticatorComponent,
    outlet: 'popup'
  },
  {
    path: 'scan-qr-code',
    component: ScanQrCodeTwoFaComponent,
    outlet: 'popup'
  },
  {
    path: 'save-backup-key',
    component: SaveBackupKeyTwoFaComponent,
    outlet: 'popup'
  },
  {
    path: 'enable-two-fa',
    component: EnableTwoFaLastStepComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-two-fa',
    component: DisableTwoFaComponent,
    outlet: 'popup'
  },
  {
    path: 'enable-multisignature',
    component: EnableMultisignatureComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-multisignature',
    component: DisableMultisignatureComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-wallet-notifications-settings',
    component: DisableWalletNotificationsSettingsComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-algo-notifications-settings',
    component: DisableAlgoNotificationsSettingsComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-wallet-messages',
    component: DisableWalletMessagesComponent,
    outlet: 'popup'
  },
  {
    path: 'disable-algo-messages',
    component: DisableAlgoMessagesComponent,
    outlet: 'popup'
  },
  {
    path: 'edit-federation-address',
    component: EditFederationAddressComponent,
    outlet: 'popup'
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    outlet: 'popup'
  },
  {
    path: 'change-email-address',
    component: ChangeEmailAddressComponent,
    outlet: 'popup'
  },
  {
    path: 'change-phone-number',
    component: ChangePhoneNumberComponent,
    outlet: 'popup'
  },
  {
    path: 'verify-phone-number/:phoneNumber',
    component: VerifyPhoneNumberComponent,
    outlet: 'popup'
  },
];

const routes: Routes = [
  {
    path: 'profile',
    component: SettingsComponent,
    children: [
      ...popupRoutes
    ],
    canActivate:[AuthGuard]
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class SettingsRoutingModule {}
