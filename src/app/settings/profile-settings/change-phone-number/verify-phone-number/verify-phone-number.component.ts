import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import {ErrorService} from '../../../../shared/error/error.service';
import {PopupService} from '../../../../shared/popup/popup.service';
import axios from 'axios'
import { environment } from 'src/environments/environment';
import { AuthService } from "../../../../shared/services/auth.service"

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
    private popupService: PopupService,
    public authService: AuthService, 
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
      this.errorService.handleError(null, 'Please enter the verification code sent to your phone.');
      return false;
    }
    if (this.code.length !== 6) {
      this.errorService.handleError(null, 'The verification code needs to have 6 characters.');
      return false;
    }
    return true;
  }

  sendAgain() {
    this.errorService.clearError();
    this.popupService.close().then(() => {
      this.snotifyService.simple('The verification code has been resent.');
    });
  }

  confirm() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      axios.post(`${environment.api_url}api/v1/phones/verifycode`, 
          {code:this.code, sessionInfo:this.phoneNumber},
          { headers: {Authorization: 'Bearer ' + this.authService.userData.token} }).then(res =>{
            if (res.data.valid === true){
              
              this.popupService.close().then(() => {
                this.snotifyService.simple('The phone number has been confirmed.');
              });
              // this.sharedService.showModalOverview();
              // this.popupService.close().then(() => {
              //   setTimeout(() => {
              //     this.router.navigate(['/settings/profile', {outlets: {popup: ['verify-phone-number', this.phoneNumber]}}]);
              //   }, 50);
              // });
            } else {
              this.errorService.handleError(null, 'Please enter a valid phone number.');
            }
        })
     
    }
  }

}
