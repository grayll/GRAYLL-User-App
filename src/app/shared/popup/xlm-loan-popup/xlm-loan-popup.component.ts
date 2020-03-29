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

  payOffLoan1() { 
    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    if (this.authService.getMaxAvailableXLM() - this.XLMLoanValue < 0){
      this.errorService.handleError(null, "Please deposit a minimum of " + this.XLMLoanValue + " XLM to your account to pay off your loan.")
      return
    }
    let loanerAddress =  environment.XLM_LOAN_ADDRESS.toString()
    let loanAmount = this.XLMLoanValue.toString()
    let asset = this.stellarService.nativeAsset   

    console.log('payOffLoan')
    
    //this.authService.GetSecretKey(this.password).then(async SecKey => {      
     // console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())
      let loanPaidId = this.authService.GetLoadPaidLedgerId()
      if (loanPaidId && +loanPaidId > 0) {
        console.log('payOffLoan 1')
        console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())          
        this.verifyTx(+loanPaidId)
      } else {    
        console.log('payOffLoan 2:pk', this.authService.userInfo.PublicKey)
        // let pk = ''
        // if (this.authService.userInfo.PublicKey && this.authService.userInfo.PublicKey != ''){
        //   pk = this.authService.userInfo.PublicKey
        // } else {
        //   pk = this.authService.userData.PublicKey
        // }        
        try {
          this.stellarService.sendAsset(this.authService.getSecretKey(), loanerAddress, loanAmount, asset, '')
          .then( txHash => {
            this.authService.SetLoanPaidLedgerId(txHash)
            this.verifyTx(txHash)     
          }).catch( e => {          
            console.log(e)
            this.error = true;
            this.success = false;
          })        
        } catch (e){
          this.error = true;
          this.success = false;
        }      
        // this.stellarService.sendAsset(SecKey, loanerAddress, loanAmount, asset, '')
        // .then( ledger => {
        //   if (ledger <= 0){            
        //     console.log('ledger <= 0')
        //     this.error = true;
        //     this.success = false;
        //     this.updateFund()
        //   } else {
        //     //console.log('Set LoadPaidLedgerId:', ledger)
        //     this.authService.SetLoanPaidLedgerId(ledger)
        //     this.verifyTx(+ledger)    
        //   }     
        // }).catch( e => {          
        //   console.log(e)
        //   this.error = true;
        //   this.success = false;
        // })
      }               
    // }).catch(err => {
    //   this.error = true;
    //   this.success = false;
    // })  
  }
  async payOffLoan() { 

    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
    if (this.authService.getMaxAvailableXLM() - this.XLMLoanValue < 0){
      this.errorService.handleError(null, "Please deposit a minimum of " + this.XLMLoanValue + " XLM to your account to pay off your loan.")
      return
    }
    let loanerAddress =  environment.XLM_LOAN_ADDRESS.toString()
    let loanAmount = this.XLMLoanValue.toString()
    let asset = this.stellarService.nativeAsset   

    console.log('payOffLoan')
    this.loadingService.show()
    //this.authService.GetSecretKey(this.password).then(async SecKey => {      
     // console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())
      let loanPaidId = this.authService.GetLoadPaidLedgerId()
      if (loanPaidId && +loanPaidId > 0) {
        console.log('payOffLoan 1')
        console.log('this.authService.GetLoadPaidLedgerId():', this.authService.GetLoadPaidLedgerId())          
        this.verifyTx(+loanPaidId)
      } else {    
        console.log('payOffLoan 2:pk', this.authService.userInfo.PublicKey)
        let pk = ''
        if (this.authService.userInfo.PublicKey && this.authService.userInfo.PublicKey != ''){
          pk = this.authService.userInfo.PublicKey
        } else {
          pk = this.authService.userData.PublicKey
        }        
        try {
          let xdr = await this.stellarService.payLoanXdr(pk, loanerAddress, loanAmount, asset, '')          
          if (xdr === 'not trusted'){
            this.error = false;
            this.success = true;
            return
          }
          console.log(xdr)
          this.authService.makeTransaction(xdr, "loanpaid").subscribe(res => {
            console.log(res)
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
        // this.stellarService.sendAsset(SecKey, loanerAddress, loanAmount, asset, '')
        // .then( ledger => {
        //   if (ledger <= 0){            
        //     console.log('ledger <= 0')
        //     this.error = true;
        //     this.success = false;
        //     this.updateFund()
        //   } else {
        //     //console.log('Set LoadPaidLedgerId:', ledger)
        //     this.authService.SetLoanPaidLedgerId(ledger)
        //     this.verifyTx(+ledger)    
        //   }     
        // }).catch( e => {          
        //   console.log(e)
        //   this.error = true;
        //   this.success = false;
        // })
      }               
    // }).catch(err => {
    //   this.error = true;
    //   this.success = false;
    // })  
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
        console.log(resp)
        this.error = false;
        this.success = true;
        this.authService.userInfo.LoanPaidStatus = 2
        //this.sharedService.setLoanPaid(); 
        this.updateFund()
        this.loadingService.hide()
      },
      err => {
        console.log('verify ledger exp: ', err)
        this.error = true;
        this.success = false;
        this.loadingService.hide()
      } 
    )    
  }
}
