import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import {faCircle} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-xlm-referral-resend-popup',
  templateUrl: './xlm-referral-resend-popup.component.html',
  styleUrls: ['./xlm-referral-resend-popup.component.scss']
})
export class XlmReferralResendPopupComponent implements OnInit {

  @ViewChild('content') modal;
  currentXLMBalance: number;
  XLMLoanValue = 1.5;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  faPhone = faCircle;

  private user: UserModel;

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService,
    private sharedService: SharedService,
    private router: Router,
  ) {
    this.user = this.userService.getUser();
    this.currentXLMBalance = this.user.XLMBalance;
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  
  goToEdit() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/referral/overview', {outlets: {popup: 'xlm-referral-edit'}}]);
      }, 200);
    });
  }

  

}
