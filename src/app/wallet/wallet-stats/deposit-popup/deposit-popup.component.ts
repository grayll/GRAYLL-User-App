import {Component, OnInit, ViewChild} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {PopupService} from '../../../shared/popup/popup.service';

@Component({
  selector: 'app-deposit-popup',
  templateUrl: './deposit-popup.component.html',
  styleUrls: ['./deposit-popup.component.css']
})
export class DepositPopupComponent implements OnInit {

  @ViewChild('content') modal;
  federationAddress: string;
  stellarAddress: string;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    public popupService: PopupService
  ) {
    this.federationAddress = 'grayll3*grayll.io';
    this.stellarAddress = 'DKJNSFUIHLJ238OHUIDLFJN23023OHUIFSDKJNS032P3DSKJAFNLSD';
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  copyFederationAddress() {
    if (this.clipboardService.copyFromContent(this.federationAddress)) {
      this.snotifyService.simple('Federation address copied.');
    }
  }

  copyStellarAddress() {
    if (this.clipboardService.copyFromContent(this.stellarAddress)) {
      this.snotifyService.simple('Stellar address copied.');
    }
  }

}
