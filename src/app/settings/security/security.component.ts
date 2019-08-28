import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubSink} from 'subsink';
import {SnotifyService} from 'ng-snotify';
import {PopupService} from '../../shared/popup/popup.service';
import {SettingsService} from '../settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent implements OnDestroy, OnInit {
   // RxJS graceful unsubscribe
   private subscriptions = new SubSink();

   // Settings Attributes
   is2FAEnabled = false;
   isIPConfirmEnabled = false;
   isMultisignatureEnabled = true;

  ngOnInit(): void {
    let userData = this.authService.GetLocalUserData();
    console.log('ngOnInit: userlocal data', userData)
    if (userData.Tfa && userData.Tfa.Enable && userData.Tfa.Enable == true){
      this.is2FAEnabled = true;
    } else {
      this.is2FAEnabled = false;
    }

    if (userData.UserSetting && userData.UserSetting.IpConfirm && userData.UserSetting.IpConfirm == true){
      this.isIPConfirmEnabled = true;
    } else {
      this.isIPConfirmEnabled = false;
    }

    if (userData.UserSetting && userData.UserSetting.MulSignature && userData.UserSetting.MulSignature == true){
      this.isMultisignatureEnabled = true;
    } else {
      this.isMultisignatureEnabled = false;
    }
  }

 

  constructor(
    private snotifyService: SnotifyService,
    private popupService: PopupService,
    private settingsService: SettingsService,
    private authService: AuthService,
  ) {
    this.observe2FAEnable();
    this.observeMultisignatureEnable();
  }

  private observe2FAEnable() {
    this.subscriptions.sink = this.settingsService.observeTwoFAEnabled()
    .subscribe((enable) => this.is2FAEnabled = enable);
  }

  private observeMultisignatureEnable() {
    this.subscriptions.sink = this.settingsService.observeMultisignatureEnabled()
    .subscribe((enable) => this.isMultisignatureEnabled = enable);
  }

  toggleIPConfirm() {    
    this.isIPConfirmEnabled = !this.isIPConfirmEnabled;
    this.authService.userData.UserSetting.IpConfirm = this.isIPConfirmEnabled
    this.authService.UpdateSetting(this.authService.userData.Uid, this.authService.userData.UserSetting)
    this.saveSettings();
  }

  toggleMulSignature() {    
    this.isMultisignatureEnabled = !this.isMultisignatureEnabled;
    this.authService.userData.UserSetting.MulSignature = this.isMultisignatureEnabled
    this.authService.UpdateSetting(this.authService.userData.Uid, this.authService.userData.UserSetting)
    this.saveSettings();
  }

  private saveSettings() {
    this.displaySettingsSavedToast();
  }

  private displaySettingsSavedToast() {
    this.snotifyService.simple('Your settings are saved.');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
