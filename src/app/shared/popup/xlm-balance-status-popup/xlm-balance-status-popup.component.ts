import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';

@Component({
  selector: 'app-xlm-balance-status-popup',
  templateUrl: './xlm-balance-status-popup.component.html',
  styleUrls: ['./xlm-balance-status-popup.component.css']
})
export class XlmBalanceStatusPopupComponent implements OnInit {

  @ViewChild('content') modal;

  constructor(
    public popupService: PopupService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

}
