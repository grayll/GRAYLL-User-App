import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorComponent} from './error/error.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {NgbCollapseModule, NgbTabsetModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AccountActivityComponent} from './account-activity/account-activity.component';
import {RouterModule} from '@angular/router';
import {CancelActiveOrdersPopupComponent} from './account-activity/cancel-active-orders-popup/cancel-active-orders-popup.component';
import {PopupModule} from './popup/popup.module';
import {MainChartComponent} from '../dashboard/main-chart/main-chart.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {ChartsModule} from 'ng2-charts';
import {ActivityComponent} from './system-activity/activity.component';
import {CountdownModule} from 'ngx-countdown';
import {AlgoNotificationItemComponent} from './algo-notification-item/algo-notification-item.component';
import {CustomModalComponent} from './custom-modal.component';
import { WalletNotificationItemComponent } from './wallet-notification-item/wallet-notification-item.component';
import { GeneralNotificationItemComponent } from './general-notification-item/general-notification-item.component';
import {RevealSecretKeyPopupComponent} from './popup/reveal-secret-key-popup/reveal-secret-key-popup.component';
import {ActivateAccountPopupComponent} from './popup/activate-account/activate-account-popup.component';
import {XlmLoanPopupComponent} from './popup/xlm-loan-popup/xlm-loan-popup.component';
import {XlmBalanceStatusPopupComponent} from './popup/xlm-balance-status-popup/xlm-balance-status-popup.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReActivateAccountComponent} from './popup/reactivate-account/reactivate-account.component';
import {ConfirmPasswordComponent} from './popup/confirm-pwd/confirm-pw';
import { ConfirmNewVersionComponent } from './popup/confirm-new-version/confirm-new-version.component';
import { SwUpdateNotifiyComponent } from './sw-update-notifiy/sw-update-notifiy.component';
import { LoaderScreenComponent } from './loader-screen/loader-screen.component';
import {XlmReferralPopupComponent} from './popup/xlm-referral-popup/xlm-referral-popup.component';
import {XlmReferralRemovePopupComponent} from './popup/xlm-referral-remove-popup/xlm-referral-remove-popup.component';
import {XlmReferrerRemovePopupComponent} from './popup/xlm-referrer-remove-popup/xlm-referrer-remove-popup.component';
import {XlmReferralResendPopupComponent} from './popup/xlm-referral-resend-popup/xlm-referral-resend-popup.component';
import {XlmReferralEditPopupComponent} from './popup/xlm-referral-edit-popup/xlm-referral-edit-popup.component';
import { ReferralActivityComponent } from './referral-activity/referral-activity.component';

@NgModule({
  declarations: [
    ErrorComponent,
    NavbarComponent,
    AccountActivityComponent,
    CancelActiveOrdersPopupComponent,
    MainChartComponent,
    ActivityComponent,
    AlgoNotificationItemComponent,
    CustomModalComponent,
    WalletNotificationItemComponent,
    GeneralNotificationItemComponent,
    RevealSecretKeyPopupComponent,
    ActivateAccountPopupComponent,
    XlmLoanPopupComponent,
    XlmBalanceStatusPopupComponent,
    ReActivateAccountComponent,
    ConfirmPasswordComponent,
    ConfirmNewVersionComponent,
    SwUpdateNotifiyComponent,
    LoaderScreenComponent,
    ReferralActivityComponent,
    XlmReferralRemovePopupComponent,
    XlmReferrerRemovePopupComponent,
    XlmReferralResendPopupComponent,
    XlmReferralEditPopupComponent,
    XlmReferralPopupComponent,
  ],
  imports: [
    CommonModule,
    NgbCollapseModule,
    FontAwesomeModule,
    NgbTabsetModule,
    RouterModule,
    PopupModule,
    NgSelectModule,
    ChartsModule,
    FormsModule,
    CountdownModule,
    NgbTooltipModule,
    InfiniteScrollModule,
    ReactiveFormsModule,
  ],
  exports: [
    ErrorComponent,
    NavbarComponent,
    AccountActivityComponent,
    ReferralActivityComponent,
    MainChartComponent,
    ActivityComponent,
    AlgoNotificationItemComponent,
    CustomModalComponent,
    WalletNotificationItemComponent,
    GeneralNotificationItemComponent,
    ConfirmNewVersionComponent,
    SwUpdateNotifiyComponent,
    LoaderScreenComponent,
    ReActivateAccountComponent,

  ]
})
export class SharedModule { }
