import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubSink} from 'subsink';
import {SnotifyService} from 'ng-snotify';
import {PopupService} from '../../shared/popup/popup.service';
import {SettingsService} from '../settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {UserModel} from '../../models/user.model';
import {UserService} from '../../authorization/user.service';
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
   private user: UserModel;

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
    private userService: UserService,
  ) {
    this.observe2FAEnable();
    this.observeMultisignatureEnable();
     this.loadAttributes();
  }
  private loadAttributes() {
    this.user = this.userService.getUser();
    this.is2FAEnabled = this.user.is2FAEnabled;
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
    this.authService.UpdateSetting("IpConfirm", this.isIPConfirmEnabled).subscribe(res =>{
      if ((res as any).valid === true ){
        this.saveSettings('Your settings are saved!');
      } else {
        this.saveSettings('Settings could not be saved! Please retry.');
      }      
    }),
    err =>{
      this.saveSettings('Settings could not be saved! Please retry.');
    }   
  }

  toggleMulSignature() {  
    if (!(this.authService.userData.Tfa && this.authService.userData.Tfa.Enable && 
      this.authService.userData.Tfa.Enable == true)){
        this.saveSettings('To enable multisignature transactions 2FA needs to enabled first.')
      return        
    } else {
      console.log('this.authService.userData:', this.authService.userData)
    } 
    this.isMultisignatureEnabled = !this.isMultisignatureEnabled;
    this.authService.userData.Setting.MulSignature = this.isMultisignatureEnabled
    this.authService.UpdateSetting("MulSignature", this.isMultisignatureEnabled).subscribe(res =>{
      if ((res as any).valid === true ){
        this.saveSettings('Your settings are saved.');
      } else {
        this.saveSettings('Settings could not be saved! Please retry.');
      }      
    }),
    err =>{
      this.saveSettings('Settings could not be saved! Please retry.');
    }
  }

  private saveSettings(msg) {
    this.snotifyService.simple(msg);
  }

  private displaySettingsSavedToast() {
    this.snotifyService.simple('Your settings are saved!');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
