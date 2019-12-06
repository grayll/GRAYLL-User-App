import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
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
  XLMLoanValue = 1.50001;

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
    // private settingsService: SettingsService,
    private errorService: ErrorService,
    // private userService: UserService,
    private sharedService: SharedService,
    private authService: AuthService,
    private stellarService: StellarService,
    private http: HttpClient,

  ) {
    //this.user = this.userService.getUser();
    this.stellarService.getAccountBalance(this.authService.userData.PublicKey, res =>{
      if (res.err){
        //this.errorService.handleError(null, 'Can not get the balance right now. Please try again later!')
        this.error = true;
      } else {
        this.currentXLMBalance = res.xlm - 1.5 - this.authService.GetOpenOrder()*0.5 - this.authService.userData.OpenOrdersXLM
        this.XLMBalanceS = this.currentXLMBalance.toString() + ' XLM'         
        this.XLMRemainS = this.currentXLMBalance - this.XLMLoanValue > 0 ? (this.currentXLMBalance - this.XLMLoanValue).toString() + ' XLM' : '0 XLM'
      }
    })     
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    if (this.authService.hash){      
      this.password = this.authService.hash
    }
  }

  payOffLoan() { 
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    if (this.currentXLMBalance - 1.50001 < 0){
      this.errorService.handleError(null, "Balance Insufficient! Please make a deposit to your account.")
      return
    }
    let loanerAddress =  environment.xlmLoanerAddress.toString()
    let loanAmount = this.XLMLoanValue.toString()
    let asset = this.stellarService.nativeAsset   
    
    this.authService.GetSecretKey(this.password).then(SecKey => {      
      console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())
      let loanPaidId = this.authService.GetLoadPaidLedgerId()
      if (loanPaidId && +loanPaidId > 0) {
        console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())          
        this.verifyTx(+loanPaidId)
      } else {          
        this.stellarService.sendAsset(SecKey, loanerAddress, loanAmount, asset, '')
        .then( ledger => {
          if (ledger <= 0){            
            console.log('ledger <= 0')
            this.error = true;
            this.success = false;
          } else {
            console.log('Set LoadPaidLedgerId:', ledger)
            this.authService.SetLoanPaidLedgerId(ledger)
            this.verifyTx(+ledger)    
          }     
        }).catch( e => {          
          console.log(e)
          this.error = true;
          this.success = false;
        })
      }               
    }).catch(err => {
      this.error = true;
      this.success = false;
    })  
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;

    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
    let ledgerId = +this.authService.GetLoadPaidLedgerId()
    if (ledgerId > 0){
      this.verifyTx(ledgerId)
    } else {
      this.error = true;
      this.success = false;
    }
  }

  verifyTx(ledger){
    this.http.post(`api/v1/users/txverify`, {ledger: ledger, action:'payoff'})    
    .subscribe(
      resp => {
        console.log(resp)
        this.error = false;
        this.success = true;
        this.sharedService.setLoanPaid(); 
      },
      err => {
        console.log('verify ledger exp: ', err)
        this.error = true;
        this.success = false;
      } 
    )    
  }
}
