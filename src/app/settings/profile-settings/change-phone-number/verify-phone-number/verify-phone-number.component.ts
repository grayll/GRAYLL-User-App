import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import {ErrorService} from '../../../../shared/error/error.service';
import {PopupService} from '../../../../shared/popup/popup.service';

@Component({
  selector: 'app-verify-phone-number',
  templateUrl: './verify-phone-number.component.html',
  styleUrls: ['./verify-phone-number.component.css']
})
export class VerifyPhoneNumberComponent implements OnInit {

  @ViewChild('content') modal;
  phoneNumber: string;
  code: string;

  constructor(
    private route: ActivatedRoute,
    private snotifyService: SnotifyService,
    private errorService: ErrorService,
    private popupService: PopupService
  ) {
    this.loadNumberFromRoute();
  }

  private loadNumberFromRoute() {
    this.phoneNumber = this.route.snapshot.params.phoneNumber;
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  clientValidation(): boolean {
    if (!this.code) {
      this.errorService.handleError(null, 'Please enter a verification code');
      return false;
    }
    if (this.code.length !== 6) {
      this.errorService.handleError(null, 'Code needs to have 6 characters.');
      return false;
    }
    return true;
  }

  sendAgain() {
    this.errorService.clearError();
    this.popupService.close().then(() => {
      this.snotifyService.simple('Code has been send again.');
    });
  }

  confirm() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      this.popupService.close().then(() => {
        this.snotifyService.simple('Phone number confirmed.');
      });
    }
  }

}
