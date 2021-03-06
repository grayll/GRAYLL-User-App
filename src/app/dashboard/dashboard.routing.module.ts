import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {ActivateAccountPopupComponent} from '../shared/popup/activate-account/activate-account-popup.component';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {XlmBalanceStatusPopupComponent} from '../shared/popup/xlm-balance-status-popup/xlm-balance-status-popup.component';
import {ConfirmPasswordComponent} from 'src/app/shared/popup/confirm-pwd/confirm-pw';
import { DepositPopupComponent } from './deposit-popup/deposit-popup.component';
import { ConfirmNewVersionComponent } from '../shared/popup/confirm-new-version/confirm-new-version.component';
import { ReActivateAccountComponent } from '../shared/popup/reactivate-account/reactivate-account.component';
import { XlmReferralPopupComponent } from '../shared/popup/xlm-referral-popup/xlm-referral-popup.component';

const popupRoutes: Routes = [
  {
    path: 'activate-account',
    component: ActivateAccountPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-loan',
    component: XlmLoanPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'confirm-new-version',
    component: ConfirmNewVersionComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-balance-status',
    component: XlmBalanceStatusPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'confirm-password',
    component: ConfirmPasswordComponent,
    outlet: 'popup'
  },
  {
    path: 'deposit',
    component: DepositPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'reactivate-account',
    component: ReActivateAccountComponent,
    outlet: 'popup'
  },
  {
    path: 'xml-referral',
    component: XlmReferralPopupComponent,
    outlet: 'popup'
  },
];

const routes: Routes = [
  {
    path: 'overview',
    component: DashboardComponent,
    children: [...popupRoutes]
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class DashboardRoutingModule { }
