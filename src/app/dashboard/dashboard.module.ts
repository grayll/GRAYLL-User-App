import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {DashboardRoutingModule} from './dashboard.routing.module';
import {ChartsModule} from 'ng2-charts';
import {HeaderBoxesComponent} from './header-boxes/header-boxes.component';
import {MainChartComponent} from './main-chart/main-chart.component';
import {InfoBoxesComponent} from './info-boxes/info-boxes.component';
import {WalletComponent} from './wallet/wallet.component';
import {TradeComponent} from './trade/trade.component';
import {SharedModule} from '../shared/shared.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    DashboardComponent,
    HeaderBoxesComponent,
    MainChartComponent,
    InfoBoxesComponent,
    WalletComponent,
    TradeComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    FontAwesomeModule,
    NgbTabsetModule
  ]
})
export class DashboardModule { }
