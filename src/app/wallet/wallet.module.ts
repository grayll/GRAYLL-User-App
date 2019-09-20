import {NgModule} from '@angular/core';
import {WalletComponent} from './wallet.component';
import {CommonModule} from '@angular/common';
import {WalletRoutingModule} from './wallet.routing.module';
import {SharedModule} from '../shared/shared.module';
import {WalletStatsComponent} from './wallet-stats/wallet-stats.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgbCarouselModule, NgbTabsetModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {DepositPopupComponent} from './wallet-stats/deposit-popup/deposit-popup.component';
import {PopupModule} from '../shared/popup/popup.module';
import {WithdrawPopupComponent} from './wallet-stats/withdraw/withdraw-popup/withdraw-popup.component';
import {WithdrawSuccessPopupComponent} from './wallet-stats/withdraw/withdraw-success-popup/withdraw-success-popup.component';
import {ReviewWithdrawPopupComponent} from './wallet-stats/withdraw/review-withdraw-popup/review-withdraw-popup.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WithdrawErrorPopupComponent} from './wallet-stats/withdraw/withdraw-error-popup/withdraw-error-popup.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgxFlagIconCssModule} from 'ngx-flag-icon-css';

@NgModule({
  declarations: [
    WalletComponent,
    WalletStatsComponent,
    DepositPopupComponent,
    WithdrawPopupComponent,
    WithdrawSuccessPopupComponent,
    ReviewWithdrawPopupComponent,
    WithdrawErrorPopupComponent
  ],
  imports: [
    CommonModule,
    WalletRoutingModule,
    SharedModule,
    FontAwesomeModule,
    NgbTooltipModule,
    NgbTabsetModule,
    PopupModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbCarouselModule,
    NgxFlagIconCssModule
  ]
})
export class WalletModule { }
