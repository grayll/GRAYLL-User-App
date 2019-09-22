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
    this.authService.UpdateSetting("MailWallet", false).then(res =>{
      this.authService.userData.Setting.MailWallet = false      
      this.authService.SetLocalUserData()
      this.popupService.close().then(() => {
        this.settingsService.sendWalletEmailNotificationsDisabled();
        this.snotifyService.simple('E-mail wallet notifications disabled.');
      });       
    }).catch(err =>{      
      this.displaySettingsFailToast()
    })
  }

  private displaySettingsFailToast() {
    this.snotifyService.simple('Can not change setting now. Please try again later.');
  }
}