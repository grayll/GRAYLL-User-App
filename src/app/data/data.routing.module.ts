import {RouterModule, Routes} from '@angular/router';
import {DataComponent} from './data.component';
import {NgModule} from '@angular/core';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {ConfirmPasswordComponent} from 'src/app/shared/popup/confirm-pwd/confirm-pw';
import { ConfirmNewVersionComponent } from '../shared/popup/confirm-new-version/confirm-new-version.component';
import { XlmReferralPopupComponent } from '../shared/popup/xlm-referral-popup/xlm-referral-popup.component';

const popupRoutes: Routes = [
  {
    path: 'xlm-loan',
    component: XlmLoanPopupComponent,
    outlet: 'popup'
  }
];

const routes: Routes = [
  {
    path: 'overview',
    component: DataComponent,
    children: [...popupRoutes]
  },
  {
    path: 'confirm-new-version',
    component: ConfirmNewVersionComponent,
    outlet: 'popup'
  },
  {
    path: 'overview/system-activity/closed-algo-positions',
    component: DataComponent,
    data: {
      tab: 'system-activity'
    }
  },
  {
    path: 'overview/wallet-activity/all-orders/completed-orders',
    component: DataComponent,
    data: {
      tab: 'wallet-activity',
      subTab: 'allOrders'
    }
  },
  {
    path: 'overview/wallet-activity/transfers',
    component: DataComponent,
    data: {
      tab: 'wallet-activity',
      subTab: 'transfers'
    }
  },
  {
    path: 'overview/wallet-activity/networkHistory',
    component: DataComponent,
    data: {
      tab: 'wallet-activity',
      subTab: 'networkHistory'
    }
  },
  {
    path: 'confirm-password',
    component: ConfirmPasswordComponent,
    outlet: 'popup'
  },
  {
    path: 'xml-referral',
    component: XlmReferralPopupComponent,
    outlet: 'popup'
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class DataRoutingModule {}
