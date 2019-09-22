import {RouterModule, Routes} from '@angular/router';
import {NotificationsComponent} from './notifications.component';
import {NgModule} from '@angular/core';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';

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
    component: NotificationsComponent,
    children: [...popupRoutes]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
