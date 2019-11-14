import {Component, OnDestroy} from '@angular/core';
import {SnotifyService} from 'ng-snotify';
import {SettingsService} from '../settings.service';
import {SubSink} from 'subsink';
import { AuthService } from "../../shared/services/auth.service"

@Component({
  selector: 'app-notifications-settings',
  templateUrl: './notifications-settings.component.html',
  styleUrls: ['./notifications-settings.component.css']
})
export class NotificationsSettingsComponent implements OnDestroy {

  // RxJS graceful unsubscribe
  private subscriptions = new SubSink();

  isGeneralEmailEnabled = false;
  isWalletEmailEnabled = false;
  isAlgoEmailEnabled = false;

  isGeneralAppEnabled = false;
  isWalletAppEnabled = false;
  isAlgoAppEnabled = false;

  constructor(
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private authService: AuthService,
  ) {
    this.observeWalletEmailNotificationsDisabled();
    this.observeWalletAppNotificationsDisabled();
    this.observeAlgoEmailNotificationsDisabled();
    this.observeAlgoAppNotificationsDisabled();

    if (this.authService.userData.Setting.AppGeneral && this.authService.userData.Setting.AppGeneral == true){
      this.isGeneralAppEnabled = true
    }
    if (this.authService.userData.Setting.AppWallet && this.authService.userData.Setting.AppWallet == true){
      this.isWalletAppEnabled = true
    }
    if (this.authService.userData.Setting.AppAlgo && this.authService.userData.Setting.AppAlgo == true){
      this.isWalletAppEnabled = true
    }

    if (this.authService.userData.Setting.MailGeneral && this.authService.userData.Setting.MailGeneral == true){
      this.isGeneralEmailEnabled = true
    }
    if (this.authService.userData.Setting.MailWallet && this.authService.userData.Setting.MailWallet == true){
      this.isWalletEmailEnabled = true
    }
    if (this.authService.userData.Setting.MailAlgo && this.authService.userData.Setting.MailAlgo == true){
      this.isAlgoEmailEnabled = true
    }
    
  }

  private observeWalletEmailNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeWalletEmailNotificationsDisabled()
      .subscribe(() => {
        this.isWalletEmailEnabled = false;
      });
  }

  private observeWalletAppNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeWalletAppNotificationsDisabled()
      .subscribe(() => {
        this.isWalletAppEnabled = false;
      });
  }

  private observeAlgoEmailNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeAlgoEmailNotificationsDisabled()
    .subscribe(() => {
      this.isAlgoEmailEnabled = false;
    });
  }

  private observeAlgoAppNotificationsDisabled() {
    this.subscriptions.sink = this.settingsService.observeAlgoAppNotificationsDisabled()
      .subscribe(() => {
        this.isAlgoAppEnabled = false;
      });
  }

  toggleGeneralEmail() {   
    this.authService.UpdateSetting("MailGeneral", !this.isGeneralEmailEnabled).subscribe(res =>{
      this.authService.userData.Setting.MailGeneral = !this.isGeneralEmailEnabled
      this.isGeneralEmailEnabled = !this.isGeneralEmailEnabled;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),
    err =>{      
      this.displaySettingsFailToast()
    }
  }

  toggleGeneralApp() {    
    this.authService.UpdateSetting("AppGeneral", !this.isGeneralAppEnabled).subscribe(res =>{
      this.authService.userData.Setting.AppGeneral = !this.isGeneralAppEnabled
      this.isGeneralAppEnabled = !this.isGeneralAppEnabled;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),
    err =>{      
      this.displaySettingsFailToast()
    }
  }
   

  enableWalletEmailNotifications() {
    this.authService.UpdateSetting("MailWallet", true).subscribe(res =>{
      this.authService.userData.Setting.MailWallet = true
      this.isWalletEmailEnabled = true;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),err =>{      
      this.displaySettingsFailToast()
    }
  }

  enableAlgoEmailNotifications() {   
    this.authService.UpdateSetting("MailAlgo", true).subscribe(res =>{
      this.authService.userData.Setting.MailAlgo = true
      this.isAlgoEmailEnabled = true;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),err =>{      
      this.displaySettingsFailToast()
    }
  }

  enableWalletAppNotifications() {   
    this.authService.UpdateSetting("AppWallet", true).subscribe(res =>{
      this.authService.userData.Setting.AppWallet = true
      this.isWalletAppEnabled = true;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),err =>{      
      this.displaySettingsFailToast()
    }
  }

  enableAlgoAppNotifications() {  

    this.authService.UpdateSetting("AppAlgo", true).subscribe(res =>{
      this.authService.userData.Setting.AppAlgo = true
      this.isAlgoAppEnabled = true;
      this.authService.SetLocalUserData()
      this.saveSettings();   
    }),err =>{      
      this.displaySettingsFailToast()
    }
  }

  private saveSettings() {
    this.displaySettingsSavedToast();
  }

  private displaySettingsSavedToast() {
    this.snotifyService.simple('Your settings are saved.');
  }
  private displaySettingsFailToast() {
    this.snotifyService.simple(`Currently this setting can't be updated. Please try again later!`);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
