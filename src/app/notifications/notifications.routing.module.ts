import {RouterModule, Routes} from '@angular/router';
import {NotificationsComponent} from './notifications.component';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'overview',
    component: NotificationsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}
