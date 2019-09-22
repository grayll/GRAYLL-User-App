import {RouterModule, Routes} from '@angular/router';
import {DataComponent} from './data.component';
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
    component: DataComponent,
    children: [...popupRoutes]
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class DataRoutingModule {}
