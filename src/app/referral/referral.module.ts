import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferralRoutingModule } from './referral-routing.module';
import { ReferralComponent } from './referral.component';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { PopupModule } from '../shared/popup/popup.module';
import { FormsModule } from '@angular/forms';
import { CountdownModule } from 'ngx-countdown';
import { ReferralHeaderBoxesComponent } from './referral-header-boxes/referral-header-boxes.component';
import { ReferrerAccountComponent } from './referrer-account/referrer-account.component';

@NgModule({
  declarations: [ReferralComponent, ReferralHeaderBoxesComponent, ReferrerAccountComponent],
  imports: [
    CommonModule,
    ReferralRoutingModule,
    SharedModule,
    FontAwesomeModule,
    NgbTabsetModule,
    PopupModule,
    CountdownModule,
    FormsModule,
  ]
})
export class ReferralModule { }
