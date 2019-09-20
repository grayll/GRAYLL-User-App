import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';

@Component({
  selector: 'app-cancel-active-orders-popup',
  templateUrl: './cancel-active-orders-popup.component.html',
  styleUrls: ['./cancel-active-orders-popup.component.css']
})
export class CancelActiveOrdersPopupComponent implements OnInit {

  @ViewChild('content') modal;

  constructor(
    public popupService: PopupService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

}
