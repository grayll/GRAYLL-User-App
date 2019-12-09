import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SettingsService} from '../../settings.service';
import {SnotifyService} from 'ng-snotify';
import { AuthService } from "../../../shared/services/auth.service"

@Component({
  selector: 'app-disable-wallet-notifications-settings',
  templateUrl: './disable-wallet-notifications-settings.component.html',
  styleUrls: ['./disable-wallet-notifications-settings.component.css']
})
export class DisableWalletNotificationsSettingsComponent implements OnInit {

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
    this.authService.UpdateSetting("MailWallet", false).subscribe(res =>{
      this.authService.userData.Setting.MailWallet = false      
      this.authService.SetLocalUserData()
      this.popupService.close().then(() => {
        this.settingsService.sendWalletEmailNotificationsDisabled();
        this.snotifyService.simple('Wallet email notifications disabled.');
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
