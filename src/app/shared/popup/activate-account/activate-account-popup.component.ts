import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import {Router} from '@angular/router';
import {UserService} from '../../../authorization/user.service';
import { AuthService } from "../../../shared/services/auth.service"
import { User, Setting } from "../../../shared/services/user";
import { StellarService } from '../../../authorization/services/stellar-service';

@Component({
  selector: 'app-pay-loan-popup',
  templateUrl: './activate-account-popup.html',
  styleUrls: ['./activate-account-popup.component.scss']
})
export class ActivateAccountPopupComponent implements OnInit {

  @ViewChild('content') modal;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;

  constructor(
    private popupService: PopupService,
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private stellarService: StellarService,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  activate() {
    if (this.didShowErrorOnce) {
      this.error = false;
      this.success = true;
      let pair = this.stellarService.generateKeyPair();
        this.stellarService.encryptSecretKey('password', pair.rawSecretKey(), (encryptedSecret) => {   
      })
     
      //this.userService.activateAccount();
    } else {
      this.error = true;
    }
    this.didShowErrorOnce = true;
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

  goToDeposit() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'deposit'}}]);
      }, 50);
    });
  }
}
