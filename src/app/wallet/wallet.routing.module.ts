import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {WalletComponent} from './wallet.component';
import {DepositPopupComponent} from './wallet-stats/deposit-popup/deposit-popup.component';
import {WithdrawPopupComponent} from './wallet-stats/withdraw/withdraw-popup/withdraw-popup.component';
import {ReviewWithdrawPopupComponent} from './wallet-stats/withdraw/review-withdraw-popup/review-withdraw-popup.component';
import {WithdrawSuccessPopupComponent} from './wallet-stats/withdraw/withdraw-success-popup/withdraw-success-popup.component';
import {WithdrawErrorPopupComponent} from './wallet-stats/withdraw/withdraw-error-popup/withdraw-error-popup.component';
import {CancelActiveOrdersPopupComponent} from '../shared/account-activity/cancel-active-orders-popup/cancel-active-orders-popup.component';
import {RevealSecretKeyPopupComponent} from '../shared/popup/reveal-secret-key-popup/reveal-secret-key-popup.component';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {XlmBalanceStatusPopupComponent} from '../shared/popup/xlm-balance-status-popup/xlm-balance-status-popup.component';

const popupRoutes: Routes = [
  {
    path: 'deposit',
    component: DepositPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'withdraw',
    component: WithdrawPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'review-withdraw',
    component: ReviewWithdrawPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'withdraw-success',
    component: WithdrawSuccessPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'withdraw-error',
    component: WithdrawErrorPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'cancel-active-orders',
    component: CancelActiveOrdersPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'reveal-secret-key',
    component: RevealSecretKeyPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-loan',
    component: XlmLoanPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-balance-status',
    component: XlmBalanceStatusPopupComponent,
    outlet: 'popup'
  }
];

const routes: Routes = [
  {
    path: 'overview',
    component: WalletComponent,
    children: [...popupRoutes]
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class WalletRoutingModule { }
