import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReferralComponent } from './referral.component';
import {XlmReferralPopupComponent} from '../shared/popup/xlm-referral-popup/xlm-referral-popup.component';
import {XlmLoanPopupComponent} from '../shared/popup/xlm-loan-popup/xlm-loan-popup.component';
import {XlmReferralRemovePopupComponent} from '../shared/popup/xlm-referral-remove-popup/xlm-referral-remove-popup.component';
import {XlmReferrerRemovePopupComponent} from '../shared/popup/xlm-referrer-remove-popup/xlm-referrer-remove-popup.component';
import {XlmReferralResendPopupComponent} from '../shared/popup/xlm-referral-resend-popup/xlm-referral-resend-popup.component';
import {XlmReferralEditPopupComponent} from '../shared/popup/xlm-referral-edit-popup/xlm-referral-edit-popup.component';

const popupRoutes: Routes = [
  {
    path: 'xml-referral',
    component: XlmReferralPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-loan',
    component: XlmLoanPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-referral-remove/:id',
    component: XlmReferralRemovePopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-referrer-remove/:id',
    component: XlmReferrerRemovePopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-referral-resend',
    component: XlmReferralResendPopupComponent,
    outlet: 'popup'
  },
  {
    path: 'xlm-referral-edit',
    component: XlmReferralEditPopupComponent,
    outlet: 'popup'
  }
];

const routes: Routes = [
  {
    path: 'overview',
    component: ReferralComponent,
    children: [...popupRoutes]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReferralRoutingModule { }
