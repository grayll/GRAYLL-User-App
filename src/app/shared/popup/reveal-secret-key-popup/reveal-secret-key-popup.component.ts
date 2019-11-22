import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import axios from 'axios'
import {AuthService} from 'src/app/shared/services/auth.service';
import {environment} from 'src/environments/environment'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reveal-secret-key-popup',
  templateUrl: './reveal-secret-key-popup.component.html',
  styleUrls: ['./reveal-secret-key-popup.component.css']
})
export class RevealSecretKeyPopupComponent implements OnInit {

  @ViewChild('content') modal;
  didContinue: boolean;
  tfaEnable: boolean = false;
  code: string;
  secret: string;
  password: string;
 
  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private stellarService: StellarService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    // check tfa status
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    this.http.post(`api/v1/users/getFieldInfo`, {tfa:'get', action:'reveal'})
    .subscribe(res => {
      if ((res as any).errCode == environment.SUCCESS){
        this.tfaEnable = (res as any).tfa;
        if (this.tfaEnable){
          this.secret = (res as any).secret;
        }        
      } else {
        this.errorService.handleError(null, `Currently the request can't not be performed. Please try again later!`);
      }
      console.log((res as any)) 
    },
    e => {
      console.log(e)
      this.errorService.handleError(null, `Currently the request can't not be performed. Please try again later!`);
    } )
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  continueReveal(){
    this.didContinue = true
    
    if (!this.tfaEnable){
      //send request token to email
      this.http.post(`api/v1/users/sendRevealSecretToken`, {})
      .subscribe(res => {
        if ((res as any).errCode == environment.SUCCESS){
          //this.tfaEnable = (res as any).tfa;
        } else {
          this.errorService.handleError(null, 'Can not peform the request right now. Please try again later!');
        } 
        console.log((res as any))        
      },
      e => {
        console.log(e)
        this.errorService.handleError(null, 'Can not peform the request right now. Please try again later!');
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
        this.authService.verifyTfaAuth(this.code, this.secret, 0).subscribe(res => {           
          if ((res as any).valid === true ){                 
            this.stellarService.decryptSecretKey(this.password, 
              {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
              SecKey => {
              if (SecKey != ''){
                this.popupService.close().then(() => {
                  this.settingsService.sendConfirmAuthorityToObserver(this.stellarService.SecretBytesToString(SecKey));
                });
              }
            })                     
          } else {        
            switch ((res as any).errCode){
              case environment.TOKEN_INVALID:
                this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
                break;
              case environment.INVALID_UNAME_PASSWORD:
                this.errorService.handleError(null, 'Your password is invalid. Please try again!')
                break;
              default:
                this.errorService.handleError(null, `Currently the request can't be performed. Please try again later!`)
                break;
            }       
          }     
          }),
          err => {
            //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
          }        
      } else {
        //send request token to email
        
        this.http.post(`api/v1/users/verifyRevealSecretToken`, {token:this.code})
        .subscribe(res => {
          if ((res as any).errCode == environment.SUCCESS){
            this.stellarService.decryptSecretKey(this.password, 
              {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
              SecKey => {
              if (SecKey != ''){               
                this.popupService.close().then(() => {
                  this.settingsService.sendConfirmAuthorityToObserver(this.stellarService.SecretBytesToString(SecKey));
                });
              }
            })
          } else if ((res as any).errCode == environment.INVALID_CODE) {
            this.errorService.handleError(null, 'Please provide a valid token.');
          } else {
            
          }
          console.log((res as any))          
          // 
        },
        e => {
          console.log(e)
          this.errorService.handleError(null, 'Can not peform the request right now. Please try again later!');
        })
      }
          
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
