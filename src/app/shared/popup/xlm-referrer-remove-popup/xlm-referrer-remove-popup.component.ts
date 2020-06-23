import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import {faCircle} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-xlm-referrer-popup',
  templateUrl: './xlm-referrer-remove-popup.component.html',
  styleUrls: ['./xlm-referrer-remove-popup.component.scss']
})
export class XlmReferrerRemovePopupComponent implements OnInit {

  @ViewChild('content') modal;
  
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  faPhone = faCircle;

  private user: UserModel;
  refererId: string

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
  ) {
    this.user = this.userService.getUser();
   
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.route.params.subscribe((param) => {
      console.log(param)
      this.refererId = param.id;
      
    })
  }

  removeReferer(){

  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

}
