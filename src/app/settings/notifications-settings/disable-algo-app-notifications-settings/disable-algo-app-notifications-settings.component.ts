import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from "../../../shared/popup/popup.service";
import {SettingsService} from "../../settings.service";
import {SnotifyService} from "ng-snotify";
import { AuthService } from "../../../shared/services/auth.service"

@Component({
  selector: 'app-disable-algo-app-notifications-settings',
  templateUrl: './disable-algo-app-notifications-settings.component.html',
  styleUrls: ['./disable-algo-app-notifications-settings.component.css']
})
export class DisableAlgoAppNotificationsSettingsComponent implements OnInit {

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
    this.authService.UpdateSetting("AppAlgo", false).then(res =>{
      this.authService.userData.Setting.AppAlgo = false      
      this.authService.SetLocalUserData()
      this.popupService.close().then(() => {
        this.settingsService.sendAlgoAppNotificationsDisabled();
        this.snotifyService.simple('App Algo system notifications disabled.');
      });       
    }).catch(err =>{      
      this.displaySettingsFailToast()
    })
  }

  private displaySettingsFailToast() {
    this.snotifyService.simple('Can not change setting now. Please try again later.');
  }

}
