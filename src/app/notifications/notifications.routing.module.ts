import {RouterModule, Routes} from '@angular/router';
import {NotificationsComponent} from './notifications.component';
import {NgModule} from '@angular/core';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {ConfirmPasswordComponent} from 'src/app/shared/popup/confirm-pwd/confirm-pw';
import { ConfirmNewVersionComponent } from '../shared/popup/confirm-new-version/confirm-new-version.component';

const popupRoutes: Routes = [
  {
    path: 'xlm-loan',
    component: XlmLoanPopupComponent,
    outlet: 'popup'
  },

];

const routes: Routes = [
  {
    path: 'overview',
    component: NotificationsComponent,
    children: [...popupRoutes]
  },
  {
    path: 'confirm-new-version',
    component: ConfirmNewVersionComponent,
    outlet: 'popup'
  },
  {
    path: 'confirm-password',
    component: ConfirmPasswordComponent,
    outlet: 'popup'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
