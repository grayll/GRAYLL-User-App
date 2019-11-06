import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import axios from 'axios'
import {AuthService} from 'src/app/shared/services/auth.service';
import {environment} from 'src/environments/environment'

@Component({
  selector: 'app-reveal-secret-key-popup',
  templateUrl: './reveal-secret-key-popup.component.html',
  styleUrls: ['./reveal-secret-key-popup.component.css']
})
export class RevealSecretKeyPopupComponent implements OnInit {

  @ViewChild('content') modal;
  didContinue: boolean;
  tfaEnable: boolean;
  code: string;
  password: string;
 
  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private stellarService: StellarService,
    private authService: AuthService,
  ) {
    // check tfa status
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    axios.post(`${environment.api_url}api/v1/users/getFieldInfo`, 
    {tfa:'get', action:'reveal'},
    { headers: { 'Authorization': 'Bearer ' + this.authService.userData.token,}
    }).then(res => {
      if (res.data.errCode == environment.SUCCESS){
        this.tfaEnable = res.data.tfa;
      } else {
        this.errorService.handleError(null, 'Can not peform the request right now. Please try again later.');
      }
      console.log(res.data) 
    }).catch(e => {
      console.log(e)
      this.errorService.handleError(null, 'Can not peform the request right now. Please try again later.');
    })    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  continueReveal(){
    this.didContinue = true
    
    if (!this.tfaEnable){
      //send request token to email
      axios.post(`${environment.api_url}api/v1/users/sendRevealSecretToken`, {},
        { headers: { 'Authorization': 'Bearer ' + this.authService.userData.token}
      }).then(res => {
        if (res.data.errCode == environment.SUCCESS){
          //this.tfaEnable = res.data.tfa;
        } else {
          this.errorService.handleError(null, 'Can not peform the request right now. Please try again later.');
        } 
        console.log(res.data)        
      }).catch(e => {
        console.log(e)
        this.errorService.handleError(null, 'Can not peform the request right now. Please try again later.');
      }) 
    }

    if (this.authService.hash){
      this.password = this.authService.hash
    } else {
      this.authService.GetLocalUserData()
    }
  }
  submit() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      if (this.tfaEnable){
        this.authService.verifyTfaAuth(this.password, this.code, 0).then(res => {           
          if (res.data.valid === true ){                 
            this.stellarService.decryptSecretKey(this.password, 
              {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
              SecKey => {
              if (SecKey != 'Decryption failed!'){
                this.settingsService.sendConfirmAuthorityToObserver(this.stellarService.SecretBytesToString(SecKey));
              }
            })                     
          } else {        
            switch (res.data.errCode){
              case environment.TOKEN_INVALID:
                this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
                break;
              case environment.INVALID_UNAME_PASSWORD:
                this.errorService.handleError(null, 'Your password is invalid. Please try again!')
                break;
              default:
                this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
                break;
            }       
          }     
          }).catch(err => {
            //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
          })        
      } else {
        //send request token to email
        
        axios.post(`${environment.api_url}api/v1/users/verifyRevealSecretToken`, {token:this.code},
        { headers: { 'Authorization': 'Bearer ' + this.authService.userData.token,}
        }).then(res => {
          if (res.data.errCode == environment.SUCCESS){
            this.stellarService.decryptSecretKey(this.password, 
              {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
              SecKey => {
              if (SecKey != 'Decryption failed!'){
                console.log('seckey:', SecKey)
                this.popupService.close().then(() => {
                  this.settingsService.sendConfirmAuthorityToObserver(this.stellarService.SecretBytesToString(SecKey));
                });
              }
            })
          } else if (res.data.errCode == environment.INVALID_CODE) {
            this.errorService.handleError(null, 'Please provide a valid token.');
          } else {
            
          }
          console.log(res.data)          
          // 
        }).catch(e => {
          console.log(e)
          this.errorService.handleError(null, 'Can not peform the request right now. Please try again later.');
        }) 

      }
      //this.errorService.handleError(null, 'A token already sent ');
     
    }
  }
  

  clientValidation(): boolean {
    if (!this.code || this.code === '') {
      this.errorService.handleError(null, 'Please enter your ' + (this.tfaEnable ? '2FA code' : 'password') + '.');
      return false;
    }
    if (!this.authService.hash){
      if (!this.password || this.password === '') {
        this.errorService.handleError(null, 'Please enter your password.');
        return false;
      }
    }
    return true;
  }

}
