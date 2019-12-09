import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SettingsService} from '../../settings.service';
import {SnotifyService} from 'ng-snotify';
import { AuthService } from "../../../shared/services/auth.service"

@Component({
  selector: 'app-disable-algo-notifications-settings',
  templateUrl: './disable-algo-notifications-settings.component.html',
  styleUrls: ['./disable-algo-notifications-settings.component.css']
})
export class DisableAlgoNotificationsSettingsComponent implements OnInit {

  @ViewChild('content') modal;

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  disable() {
    this.authService.UpdateSetting("MailAlgo", false).subscribe(res =>{
      this.authService.userData.Setting.MailAlgo = false      
      this.authService.SetLocalUserData()
      this.popupService.close().then(() => {
        this.settingsService.sendAlgoEmailNotificationsDisabled();
        this.snotifyService.simple('Algorithmic System email notifications disabled.');
      });       
    }),
    err => {      
      this.displaySettingsFailToast()
    }
  }

  private displaySettingsFailToast() {
    this.snotifyService.simple('The settings have not been updated! Please retry.');
  }

}
