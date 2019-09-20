import {RouterModule, Routes} from '@angular/router';
import {DataComponent} from './data.component';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'overview',
    component: DataComponent
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)]
})
export class DataRoutingModule {}
