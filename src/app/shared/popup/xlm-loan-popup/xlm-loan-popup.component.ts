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
import { LoadingService } from '../../services/loading.service';
import { env } from 'process';

@Component({
  selector: 'app-xlm-loan-popup',
  templateUrl: './xlm-loan-popup.component.html',
  styleUrls: ['./xlm-loan-popup.component.scss']
})
export class XlmLoanPopupComponent implements OnInit {

  @ViewChild('content') modal;
 // currentXLMBalance: number;
  XLMLoanValue:number = 2.1000;

  // XLMBalanceS: string = '';
  // XLMLoanS: string = this.XLMLoanValue.toString()+ ' XLM';
  // XLMRemainS: string = '';
  isSubmitted: boolean = false
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  password: string;
  isHashCached:boolean
  private user: UserModel;

  constructor(
    public popupService: PopupService,    
    private errorService: ErrorService,    
    private sharedService: SharedService,
    private authService: AuthService,
    private stellarService: StellarService,
    private http: HttpClient,
    private loadingService: LoadingService,

  ) {
    //this.user = this.userService.getUser();
    //this.currentXLMBalance = this.authService.getMaxAvailableXLM()
    //this.XLMBalanceS = this.currentXLMBalance.toString() + ' XLM'         
    //this.XLMRemainS = this.currentXLMBalance - this.XLMLoanValue > 0 ? (this.currentXLMBalance - this.XLMLoanValue).toString() + ' XLM' : '0 XLM'    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    if (this.authService.hash){      
      this.password = this.authService.hash
    }
  }
  
  async payOffLoanNew() { 
    if (this.isSubmitted){
      return
    }
    this.isSubmitted = true
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    if (this.authService.getMaxAvailableXLM() - this.XLMLoanValue < 0){
      this.errorService.handleError(null, "Please deposit a minimum of " + this.XLMLoanValue + " XLM to your account to pay off your loan.")
      this.isSubmitted = false
      return
    }
   
    this.loadingService.show()  
    this.http.post(`api/v1/users/PayLoan`, {})    
    .subscribe(
      resp => {
        if ((resp as any).errCode == environment.SUCCESS){
        this.error = false;
        this.success = true;
        this.authService.userInfo.LoanPaidStatus = 2
        this.updateFund()
        this.loadingService.hide()
        } else {
          this.error = true;
          this.success = false;
          this.loadingService.hide()
        }
      },
      err => {
        console.log('verify ledger exp: ', err)
        this.error = true;
        this.success = false;
        this.loadingService.hide()
      } 
    )

  }
  async payOffLoan() { 
    if (this.isSubmitted){
      return
    }
    this.isSubmitted = true
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    if (this.authService.getMaxAvailableXLM() - this.XLMLoanValue < 0){
      this.errorService.handleError(null, "Please deposit a minimum of " + this.XLMLoanValue + " XLM to your account to pay off your loan.")
      this.isSubmitted = false
      return
    }
    let loanerAddress =  environment.XLM_LOAN_ADDRESS.toString()
    let loanAmount = this.XLMLoanValue.toString()
    let asset = this.stellarService.nativeAsset   
    
    this.loadingService.show()    
      let loanPaidId = this.authService.GetLoadPaidLedgerId()
      if (loanPaidId && +loanPaidId > 0) {        
       // console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())
        this.isSubmitted = false          
        this.verifyTx(+loanPaidId)
      } else {        
        let pk = ''
        if (this.authService.userInfo.PublicKey && this.authService.userInfo.PublicKey != ''){
          pk = this.authService.userInfo.PublicKey
        } else {
          pk = this.authService.userData.PublicKey
        }     
        this.isSubmitted = false   
        try {
          let xdr = await this.stellarService.payLoanXdr(pk, loanerAddress, loanAmount, asset, '')          
          if (xdr === 'not trusted'){
            this.error = false;
            this.success = true;
            return
          }
         // console.log(xdr)
          this.authService.makeTransaction(xdr, "loanpaid").subscribe(res => {
           // console.log(res)
            if ((res as any).errCode == "tx_success"){
              this.error = false;
              this.success = true;
              this.authService.userInfo.LoanPaidStatus = 2
              this.updateFund()
              this.loadingService.hide()
              // remove additional signer

            } else {
              this.error = true;
              this.success = false;
              this.loadingService.hide()
            }
          })          
        } catch (e){
          this.error = true;
          this.success = false;
          this.loadingService.hide()
        }   
      }
  }
  updateFund(){
    this.authService.userMetaStore.XLM = this.authService.userMetaStore.XLM - this.XLMLoanValue
    this.authService.SetLocalUserData()
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

  verifyTx(txHash){
    this.http.post(`api/v1/users/txverify`, {txHash: txHash, action:'payoff'})    
    .subscribe(
      resp => {
        //console.log(resp)
        this.error = false;
        this.success = true;
        this.authService.userInfo.LoanPaidStatus = 2
        //this.sharedService.setLoanPaid(); 
        this.updateFund()
        this.loadingService.hide()
      },
      err => {
        //console.log('verify ledger exp: ', err)
        this.error = true;
        this.success = false;
        this.loadingService.hide()
      } 
    )    
  }
}
