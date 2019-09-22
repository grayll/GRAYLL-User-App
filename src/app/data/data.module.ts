import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DataComponent} from './data.component';
import {DataRoutingModule} from './data.routing.module';
import {SharedModule} from '../shared/shared.module';
import {DataHeaderBoxesComponent} from './data-header-boxes/data-header-boxes.component';
import {ChartsModule} from 'ng2-charts';
import {NgbCarouselModule, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    DataComponent,
    DataHeaderBoxesComponent
  ],
  imports: [
    CommonModule,
    DataRoutingModule,
    SharedModule,
    ChartsModule,
    NgbTabsetModule,
    NgbCarouselModule,
    FontAwesomeModule
  ]
})
export class DataModule { }
