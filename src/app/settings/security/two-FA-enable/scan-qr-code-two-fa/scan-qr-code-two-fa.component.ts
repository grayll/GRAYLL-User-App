import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../../shared/shared.service';
import {AuthService} from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-scan-qr-code-two-fa',
  templateUrl: './scan-qr-code-two-fa.component.html',
  styleUrls: ['./scan-qr-code-two-fa.component.css']
})
export class ScanQrCodeTwoFaComponent implements OnInit {

  @ViewChild('content') modal;

  public dataUrl: string;

  constructor(
    public popupService: PopupService,
    private router: Router,
    private sharedService: SharedService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);

    // Call QRcode service
    this.dataUrl = this.authService.userData.Tfa.DataURL
    console.log(this.dataUrl);
  }

  back() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/settings/profile', {outlets: {popup: 'google-authenticator'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }

  next() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/settings/profile', {outlets: {popup: 'save-backup-key'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }
}
