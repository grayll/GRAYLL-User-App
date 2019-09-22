import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PopupHeaderComponent} from './popup-header/popup-header.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PopupHeaderComponent
  ],
  exports: [
    PopupHeaderComponent
  ]
})
export class PopupModule { }
