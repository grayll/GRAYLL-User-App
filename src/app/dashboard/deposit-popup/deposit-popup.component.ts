import {Component, OnInit, ViewChild} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {PopupService} from 'src/app/shared/popup/popup.service';
import { AuthService } from "src/app/shared/services/auth.service"
import { Router } from '@angular/router';

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
    public popupService: PopupService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress =  this.authService.userData.PublicKey;
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

  depositClose(){
    //this.router.navigate([{ outlets: { popup: null }}]);
    this.popupService.close()
    // this.popupService.close().then(() => {
    //   setTimeout(() => {
    //     //this.router.navigate(['/wallet/overview']);

    //     this.router.navigateByUrl('/wallet/overview')
    //   }, 100);
    // });
  }

}
