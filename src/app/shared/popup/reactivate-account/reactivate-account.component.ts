import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import {ErrorService} from '../../error/error.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import {AuthService} from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-reactivate-account',
  templateUrl: './reactivate-account.component.html',
  styleUrls: ['./reactivate-account.component.css']
})
export class ReActivateAccountComponent implements OnInit {

  @ViewChild('content') modal;
 
  password: string = '';
  secretKey: string = ''
 
  constructor(
    public popupService: PopupService,    
    private errorService: ErrorService,
    private stellarService: StellarService,
    private authService: AuthService,  
    private http: HttpClient,  
    private loadingService: LoadingService,
  ) {
    // check tfa status
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }
  
  submit() {
    this.errorService.clearError();   
    if (!this.clientValidation()){
      return
    }
    this.loadingService.show()
    let secretKey = this.stellarService.StringToSecretBytes(this.secretKey)
    // Parse private key to compare with the public key
    let pwd = this.authService.hash
    if (!this.authService.hash){
      pwd = this.password
    }
   
    this.stellarService.encryptSecretKey(pwd, secretKey, '', enSecret => {
      this.http.post('api/v1/users/saveEnSecretKeyData', {enSecretKey:enSecret.EnSecretKey, salt: enSecret.Salt}).subscribe( 
        res => {
          if ((res as any).errCode == environment.SUCCESS)  {            
            this.stellarService.encryptSecretKey(this.authService.userInfo.LocalKey, secretKey, enSecret.Salt, (secretKeyBundle) => {             
              this.authService.userData.EnSecretKey = secretKeyBundle.EnSecretKey 
              this.authService.secretKey =  secretKey            
              this.authService.SetLocalUserData()            
            })  
            this.loadingService.hide()
            this.popupService.close()
          } else {
            //this.form.reset()              
            let message = 'Can reactivate account now. Please retry!'
            this.errorService.handleError(null, message); 
            this.loadingService.hide()
          }
        },
        e => {
          console.log(e) 
          //this.form.reset()              
          let message = 'Can reactivate account now. Please retry!'
          this.errorService.handleError(null, message); 
          this.loadingService.hide()    
        }
      ) 
    })
  }

  clientValidation(): boolean {    
    if (!this.authService.hash){
      if (!this.password || this.password === '') {
        this.errorService.handleError(null, 'Please enter the valid password!');
        return false;
      }
    }
    var numbers = /^S[A-Z0-9]{55}$/;
      if (!this.secretKey || this.secretKey === '' || !this.secretKey.match(numbers)) {
        this.errorService.handleError(null, 'Please enter the valid secret key!');
        return false;
    }

    if (!this.stellarService.verifyPublicKey(this.secretKey, this.authService.userInfo.PublicKey)){
      this.errorService.handleError(null, 'The secret key is not matched with your public key!');
      return false;
    }
    return true;
  }

}
