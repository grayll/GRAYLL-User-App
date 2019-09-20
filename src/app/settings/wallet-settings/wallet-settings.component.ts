import {Component, OnDestroy} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import { AuthService } from "../../shared/services/auth.service"
import {SubSink} from 'subsink';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-wallet-settings',
  templateUrl: './wallet-settings.component.html',
  styleUrls: ['./wallet-settings.component.css']
})
export class WalletSettingsComponent implements OnDestroy {

  federationAddress: string;
  stellarAddress: string;
  secretKey: string;
  isSecretKeyRevealed: boolean;
  private subscriptions = new SubSink();

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress = this.authService.userData.PublicKey;
    this.secretKey = 'GBMF3WYPDWQFOXVL2CO6NQPGQZJWLLKSGVTGGV7QPKCZCIQ3PZJGX4OG';

    this.subscriptions.sink = this.settingsService.observeFederationAddress().subscribe(
      fed => {
        this.authService.userData.Federation = fed
        this.federationAddress = fed
      }
    )
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
