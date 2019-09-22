import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {ActivateAccountPopupComponent} from '../shared/popup/activate-account/activate-account-popup.component';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {XlmBalanceStatusPopupComponent} from '../shared/popup/xlm-balance-status-popup/xlm-balance-status-popup.component';

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
    path: 'xlm-balance-status',
    component: XlmBalanceStatusPopupComponent,
    outlet: 'popup'
  }
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
