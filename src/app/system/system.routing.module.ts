import {RouterModule, Routes} from '@angular/router';
import {SystemComponent} from './system.component';
import {NgModule} from '@angular/core';
import {CancelAlgoPositionsComponent} from '../shared/system-activity/cancel-algo-positions/cancel-algo-positions.component';
import {OpenAlgoPositionSuccessComponent} from './system-header-boxes/open-algo-position-success/open-algo-position-success.component';
import {OpenAlgoPositionErrorComponent} from './system-header-boxes/open-algo-position-error/open-algo-position-error.component';

const popupRoutes: Routes = [
  {
    path: 'cancel-algo-positions',
    component: CancelAlgoPositionsComponent,
    outlet: 'popup'
  },
  {
    path: 'open-algo-position-success',
    component: OpenAlgoPositionSuccessComponent,
    outlet: 'popup'
  },
  {
    path: 'open-algo-position-error',
    component: OpenAlgoPositionErrorComponent,
    outlet: 'popup'
  }
];

const routes: Routes = [
  {
    path: 'overview',
    component: SystemComponent,
    children: [...popupRoutes]
  },
  {
    path: 'activity',
    component: SystemComponent,
    children: [...popupRoutes],
    data: {
      scroll: true
    }
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class SystemRoutingModule {}
