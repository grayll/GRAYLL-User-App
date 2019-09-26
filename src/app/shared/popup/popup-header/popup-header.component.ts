import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {PopupService} from '../popup.service';

@Component({
  selector: 'app-popup-header',
  templateUrl: './popup-header.component.html',
  styleUrls: ['./popup-header.component.css']
})
export class PopupHeaderComponent implements OnChanges {

  @Input() popupHeaderTitle: string;
  @Input() hideCloseButton: boolean;
  @Input() onCloseRedirectTo: string;
  @Output() popupClosed = new EventEmitter<boolean>();
  constructor(private popupService: PopupService) { }

  closePopup() {
    this.popupClosed.emit(true);
    if (this.onCloseRedirectTo) {
      this.popupService.closeAndRedirectTo(this.onCloseRedirectTo);
    } else {
      this.popupService.close();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hideClose = changes.hideCloseButton;
    const redirectUrl = changes.onCloseRedirectTo;
    if (hideClose && hideClose.currentValue) {
      this.hideCloseButton = hideClose.currentValue;
    } else if (redirectUrl && redirectUrl.currentValue) {
      this.onCloseRedirectTo = redirectUrl.currentValue;
    }
  }

}
