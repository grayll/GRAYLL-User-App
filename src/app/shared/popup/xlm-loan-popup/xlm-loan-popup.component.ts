import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import { AuthService } from "../../../shared/services/auth.service"
import { StellarService } from '../../../authorization/services/stellar-service';
import { environment } from 'src/environments/environment';
import Axios from 'axios';

@Component({
  selector: 'app-xlm-loan-popup',
  templateUrl: './xlm-loan-popup.component.html',
  styleUrls: ['./xlm-loan-popup.component.scss']
})
export class XlmLoanPopupComponent implements OnInit {

  @ViewChild('content') modal;
  currentXLMBalance: number;
  XLMLoanValue = 1.5;

  XLMBalanceS: string = '';
  XLMLoanS: string = this.XLMLoanValue.toString()+ ' XLM';
  XLMRemainS: string = '';

  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  password: string;

  private user: UserModel;

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService,
    private sharedService: SharedService,
    private authService: AuthService,
    private stellarService: StellarService,
  ) {
    this.user = this.userService.getUser();
    this.stellarService.getAccountBalance(this.authService.userData.PublicKey, res =>{
      if (res.err){
        this.errorService.handleError(null, 'Can not get the balance right now. Please try again later.')
      } else {
        this.currentXLMBalance = res.xlm
        this.XLMBalanceS = this.currentXLMBalance.toString() + ' XLM'         
        this.XLMRemainS = (this.currentXLMBalance - this.XLMLoanValue).toString() + ' XLM' 
      }
    })
     
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  payOffLoan() {
    //if (this.didShowErrorOnce) {
      
      console.log(this.authService.userData.EnSecretKey)
      console.log(this.authService.userData.SecretKeySalt)
      this.stellarService.decryptSecretKey(this.password, 
        {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      SecKey => {
        if (SecKey != 'Decryption failed!'){  
          console.log(environment.xlmLoanerAddress)  
          // let ledger = this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), environment.xlmLoanerAddress, 
          // this.XLMLoanValue.toString(), this.stellarService.nativeAsset, '')

         
          
          this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), environment.xlmLoanerAddress, 
            this.XLMLoanValue.toString(), this.stellarService.nativeAsset, '', ledger => {
              if (ledger <= 0){
                this.errorService.handleError(null, 'Can not payoff Loan now. Please try again later.')
              }
              Axios.post(`${environment.api_url}api/v1/users/txverify`,{ledger: ledger, action:'payoff'}, 
              {
                headers: {
                  'Authorization': 'Bearer ' + this.authService.userData.token,        
                }
              })
              .then(resp =>{
                console.log(resp)
                this.error = false;
                this.success = true;
                this.sharedService.setIsLoanPaid(true);
                this.userService.loanPaid(true);
              }).catch(err => {
                console.log(err)
              })

                //console.log('href: ', res._links.transaction);
                //https://horizon-testnet.stellar.org/ledgers/1072717/payments
                //https://horizon-testnet.stellar.org/payments?cursor=4607284432871424
            })
        }
      })  
      // this.error = false;
      // this.success = true;
      // this.sharedService.setIsLoanPaid(true);
      // this.userService.loanPaid(true);
    // } else {
    //   this.error = true;
    // }
    //this.didShowErrorOnce = true;
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

}
