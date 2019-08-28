import {Component} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';

@Component({
  selector: 'app-wallet-settings',
  templateUrl: './wallet-settings.component.html',
  styleUrls: ['./wallet-settings.component.css']
})
export class WalletSettingsComponent {

  federationAddress: string;
  stellarAddress: string;
  secretKey: string;
  isSecretKeyRevealed: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService
  ) {
    this.federationAddress = 'grayll3*grayll.io';
    this.stellarAddress = 'DKJNSFUIHLJ238OHUIDLFJN23023OHUIFSDKJNS032P3DSKJAFNLSD';
    this.secretKey = 'GBMF3WYPDWQFOXVL2CO6NQPGQZJWLLKSGVTGGV7QPKCZCIQ3PZJGX4OG';
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

  toggleRevealSecretKey() {
    this.isSecretKeyRevealed = !this.isSecretKeyRevealed;
  }

}
