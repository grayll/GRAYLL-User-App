import {Component} from '@angular/core';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../settings.service';
import {SubSink} from 'subsink';

@Component({
  selector: 'app-notifications-settings',
  templateUrl: './notifications-settings.component.html',
  styleUrls: ['./notifications-settings.component.css']
})
export class NotificationsSettingsComponent {

  // RxJS graceful unsubscribe
  private subscriptions = new SubSink();

  isGeneralEnabled = false;
  isWalletEnabled = true;
  isAlgoEnabled = false;

  constructor(
    private snotifyService: SnotifyService,
    private settingsService: SettingsService
  ) {
    this.observeWalletNotificationsDisabled();
    this.observeAlgoNotificationsDisabled();
  }

  private observeWalletNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeWalletNotificationsDisabled()
      .subscribe(() => {
        this.isWalletEnabled = false;
      });
  }

  private observeAlgoNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeAlgoNotificationsDisabled()
    .subscribe(() => {
      this.isAlgoEnabled = false;
    });
  }

  toggleGeneral() {
    this.isGeneralEnabled = !this.isGeneralEnabled;
    this.saveSettings();
  }

  enableWalletNotifications() {
    this.isWalletEnabled = true;
    this.saveSettings();
  }

  enableAlgoNotifications() {
    this.isAlgoEnabled = true;
    this.saveSettings();
  }

  private saveSettings() {
    this.displaySettingsSavedToast();
  }

  private displaySettingsSavedToast() {
    this.snotifyService.simple('Your settings are saved.');
  }
}
