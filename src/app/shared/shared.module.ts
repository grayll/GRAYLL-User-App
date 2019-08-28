import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorComponent} from './error/error.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    ErrorComponent,
    NavbarComponent
  ],
  imports: [
    CommonModule,
    NgbCollapseModule,
    FontAwesomeModule
  ],
  exports: [
    ErrorComponent,
    NavbarComponent
  ]
})
export class SharedModule { }
