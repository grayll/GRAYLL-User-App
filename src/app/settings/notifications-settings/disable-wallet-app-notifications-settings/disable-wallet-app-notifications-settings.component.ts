import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from "../../../shared/popup/popup.service";
import {SettingsService} from "../../settings.service";
import {SnotifyService} from "ng-snotify";
import { AuthService } from "../../../shared/services/auth.service"

@Component({
  selector: 'app-disable-wallet-app-notifications-settings',
  templateUrl: './disable-wallet-app-notifications-settings.component.html',
  styleUrls: ['./disable-wallet-app-notifications-settings.component.css']
})
export class DisableWalletAppNotificationsSettingsComponent implements OnInit {

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
    this.authService.UpdateSetting("AppWallet", false).subscribe(res =>{
      this.authService.userData.Setting.AppWallet = false      
      this.authService.SetLocalUserData()
      this.popupService.close().then(() => {
        this.settingsService.sendWalletAppNotificationsDisabled();
        this.snotifyService.simple('Wallet App notifications disabled.');
      });       
    }),
    err =>{      
      this.displaySettingsFailToast()
    }
  }

  private displaySettingsFailToast() {
    this.snotifyService.simple('The settings have not been updated! Please retry.');
  }

}
