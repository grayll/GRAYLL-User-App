import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PopupHeaderComponent} from './popup-header/popup-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PopupHeaderComponent
  ],
  exports: [
    PopupHeaderComponent
  ]
})
export class PopupModule { }
