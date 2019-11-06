import {Component, OnDestroy, OnInit} from '@angular/core';
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
export class WalletSettingsComponent implements OnInit, OnDestroy {

  federationAddress: string = '';
  stellarAddress: string = '';
  secretKey: string;
  isSecretKeyRevealed: boolean;
  private subscriptions = new SubSink();

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    if (this.authService.userData.Federation){
      this.federationAddress = this.authService.userData.Federation;
    }
    if (this.authService.userData.PublicKey){
      this.stellarAddress = this.authService.userData.PublicKey;
    }
    this.secretKey = '';

    this.subscriptions.sink = this.settingsService.observeFederationAddress().subscribe(
      fed => {
        this.authService.userData.Federation = fed
        this.federationAddress = fed
      }
    )
}
  ngOnInit(): void {
    this.observeRevealSecretKey();
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

  hideSecretKey() {
    this.isSecretKeyRevealed = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  observeRevealSecretKey() {
    this.subscriptions.sink = this.settingsService.observeConfirmAuthority()
    .subscribe((secretKey) => {
      // Not a secure solution. Please make a request to backend to get the code
      this.isSecretKeyRevealed = true;
      this.secretKey = secretKey
    });
  }

}
