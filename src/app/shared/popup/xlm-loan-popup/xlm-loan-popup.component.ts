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
import { HttpClient } from '@angular/common/http';

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
  isHashCached:boolean
  private user: UserModel;

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService,
    private sharedService: SharedService,
    private authService: AuthService,
    private stellarService: StellarService,
    private http: HttpClient,
  ) {
    this.user = this.userService.getUser();
    this.stellarService.getAccountBalance(this.authService.userData.PublicKey, res =>{
      if (res.err){
        this.errorService.handleError(null, 'Can not get the balance right now. Please try again later!')
      } else {
        this.currentXLMBalance = res.xlm
        this.XLMBalanceS = this.currentXLMBalance.toString() + ' XLM'         
        this.XLMRemainS = (this.currentXLMBalance - this.XLMLoanValue).toString() + ' XLM' 
      }
    })
     
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    if (this.authService.hash){
      this.isHashCached = true
      this.password = this.authService.hash
    }
  }

  payOffLoan() { 
      
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    
    this.stellarService.decryptSecretKey(this.password, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
    SecKey => {
      if (SecKey != 'Decryption failed!'){  
        if (this.authService.userData.LoanPaidLedger) {
          this.verifyTx(this.authService.userData.LoanPaidLedger)
        } else {
          this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), environment.xlmLoanerAddress, 
          this.XLMLoanValue.toString(), this.stellarService.nativeAsset, '')
          .then( ledger => {
            if (ledger <= 0){
              this.errorService.handleError(null, 'Can not payoff Loan now. Please try again later!')
            }
            this.authService.userData.LoanPaidLedger = ledger
            this.authService.SetLocalUserData()
            this.verifyTx(ledger)
            // Axios.post(`${environment.api_url}api/v1/users/txverify`,{ledger: ledger, action:'payoff'}, 
            // {
            //   headers: {
            //     'Authorization': 'Bearer ' + this.authService.userData.token,        
            //   }
            // })
            // .then(resp =>{
            //   console.log(resp)
            //   this.error = false;
            //   this.success = true;
            //   this.sharedService.setIsLoan(false);
            //   //this.userService.loanPaid(true);
            // }).catch(err => {
            //   console.log(err)
            //   this.error = true;
            // })
          }).catch( e => {
            this.errorService.handleError(null, 'Can not execute XLM pay-off loaner now. Please try again later!')
            console.log(e)
            this.error = true;
          })
        }          
      } else {
        this.errorService.handleError(null, 'Can not execute XLM pay-off loaner now. Please try again later!')
      }
    })  
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;

    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    this.verifyTx(this.authService.userData.LoanPaidLedger)

    // Axios.post(`${environment.api_url}api/v1/users/txverify`,{ledger: this.authService.userData.LoanPaidLedger, action:'payoff'}, 
    // {
    //   headers: {
    //     'Authorization': 'Bearer ' + this.authService.userData.token,        
    //   }
    // })
    // .then(resp =>{
    //   console.log(resp)
    //   this.error = false;
    //   this.success = true;
    //   this.sharedService.setIsLoan(false);      
    // }).catch(err => {
    //   console.log(err)
    //   this.error = true;
    //   this.errorService.handleError(null, 'Can not execute XLM pay-off loaner now. Please try again later!')
    // })
  }

  verifyTx(ledger){
    this.http.post(`api/v1/users/txverify`, {ledger: ledger, action:'payoff'})
    .subscribe(resp =>{
      console.log(resp)
      this.error = false;
      this.success = true;
      this.sharedService.setIsLoan(false);      
    }),
    err => {
      console.log(err)
      this.error = true;
      this.errorService.handleError(null, 'Can not execute XLM pay-off loaner now. Please try again later!')
    }
  }

}
