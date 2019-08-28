import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PopupService} from '../popup.service';

@Component({
  selector: 'app-popup-header',
  templateUrl: './popup-header.component.html',
  styleUrls: ['./popup-header.component.css']
})
export class PopupHeaderComponent {

  @Input() popupHeaderTitle: string;
  @Output() popupClosed = new EventEmitter<boolean>();
  constructor(private popupService: PopupService) { }

  closePopup() {
    this.popupClosed.emit(true);
    this.popupService.close();
  }

}
