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

    if (userData.Setting && userData.Setting.IpConfirm && userData.Setting.IpConfirm == true){
      this.isIPConfirmEnabled = true;
    } else {
      this.isIPConfirmEnabled = false;
    }

    if (userData.Setting && userData.Setting.MulSignature && userData.Setting.MulSignature == true){
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
    this.authService.userData.Setting.IpConfirm = this.isIPConfirmEnabled
    this.authService.UpdateSetting("IpConfirm", this.isIPConfirmEnabled).then(res =>{
      if (res.data.valid === true ){
        this.saveSettings('Your settings are saved.');
      } else {
        this.saveSettings('Can not save the settings now. Please try again later.');
      }      
    }).catch(err =>{
      this.saveSettings('Can not save the settings now. Please try again later.');
    })    
  }

  toggleMulSignature() {  
    if (!(this.authService.userData.Tfa && this.authService.userData.Tfa.Enable && 
      this.authService.userData.Tfa.Enable == true)){
        this.saveSettings('Multisignature needs 2FA enable')
      return        
    } else {
      console.log('this.authService.userData:', this.authService.userData)
    } 
    this.isMultisignatureEnabled = !this.isMultisignatureEnabled;
    this.authService.userData.Setting.MulSignature = this.isMultisignatureEnabled
    this.authService.UpdateSetting("MulSignature", this.isMultisignatureEnabled).then(res =>{
      if (res.data.valid === true ){
        this.saveSettings('Your settings are saved.');
      } else {
        this.saveSettings('Can not save the settings now. Please try again later.');
      }      
    }).catch(err =>{
      this.saveSettings('Can not save the settings now. Please try again later.');
    })    
  }

  private saveSettings(msg) {
    this.snotifyService.simple(msg);
  }

  private displaySettingsSavedToast() {
    this.snotifyService.simple('Your settings are saved.');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
