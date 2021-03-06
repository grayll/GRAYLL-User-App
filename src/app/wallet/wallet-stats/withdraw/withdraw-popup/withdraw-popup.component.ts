import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {faEnvelope, faMobile, faWallet} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../../../../shared/shared.service';
import {Router} from '@angular/router';
import {ErrorService} from '../../../../shared/error/error.service';
import {WithdrawModel} from '../withdraw.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';


@Component({
  selector: 'app-withdraw-popup',
  templateUrl: './withdraw-popup.component.html',
  styleUrls: ['./withdraw-popup.component.css']
})
export class WithdrawPopupComponent implements OnInit {

  @ViewChild('content') modal;
  withdrawModel: WithdrawModel;
  totalXLM: number;
  totalGRX: number;
  XLMValue: string;
  withdrawValue: string;
  usdValue: string;
  memoMessage: string;
  recipient: string;
  selectedTabId: string;
  selectedAssestTabId: string;
  selectedCountryCode: string;
  phoneNumber: string;
  emailAddress: string;
  noMemoMessageSelected: boolean;
  isMemoMessageSelected: boolean;
  // grxUsdValue: number;  
  // xlmUsdValue: number;
  grxPrice: number;  
  xlmPrice: number;

  // Font Awesome Icons
  faWallet = faWallet;
  faMobile = faMobile;
  faEnvelope = faEnvelope;

  constructor(
    public popupService: PopupService,
    private sharedService: SharedService,
    private router: Router,
    private errorService: ErrorService,
    private authService: AuthService,
    private stellarService: StellarService,
  ) {
    if (this.authService.userMetaStore.XLM){
      this.totalXLM = this.authService.userMetaStore.XLM;
    } else {
      this.totalXLM = 0
    }
    if (this.authService.userMetaStore.GRX){
      this.totalGRX = this.authService.userMetaStore.GRX;
    } else {
      this.totalGRX = 0
    }
    this.XLMValue = '';
    this.memoMessage = null;
    this.withdrawValue = '';
    this.recipient = null;
    this.withdrawModel = new WithdrawModel();
    this.isMemoMessageSelected = true;

    // this.xlmPrice = this.authService.userData.xlmPrice
    // this.grxPrice = this.authService.userData.grxPrice
    this.authService.GetOpenOrder()
  }

  ngOnInit() {
    this.selectedCountryCode = 'af';
    this.popupService.open(this.modal);
    this.selectedTabId = 'wallet';
    this.selectedAssestTabId = 'GRX' 
  }

  onTabChange(id: string) {
    this.selectedTabId = id;
  }
  onTabAssetChange(id: string) {
    this.selectedAssestTabId = id;
    this.withdrawModel.asset = id
    if (id == 'XLM'){
      this.KeyUp('xlm')
    } else if (id == 'GRX'){
      this.KeyUp('grx')
    }    
  }

  populateMaxGRX() {
    this.withdrawValue = this.authService.getMaxWithdrawGRX().toFixed(7) 
    this.usdValue = (+this.withdrawValue*this.authService.priceInfo.xlmusd*this.authService.priceInfo.xlmgrx).toFixed(5)
  }

  populateMaxXLM() {    
    this.withdrawValue = this.authService.getMaxWithdrawXLM().toFixed(7)
    this.usdValue = (+this.withdrawValue*this.authService.priceInfo.xlmusd).toFixed(5)
  }
  getMaxXLMForTrade(){
    if (this.authService.getMaxAvailableXLM() - 0.50001 > 0){
      return (this.authService.getMaxAvailableXLM() - 0.50001).toFixed(7)
    } else {
      return '0'
    }    
  }

  next() {
    this.errorService.clearError();
    this.showOrHideUIElements();

    this.clientValidation().then( valid => {      
      if (valid){
        if ((this.memoMessage && this.selectedTabId === 'wallet') ||
          (this.noMemoMessageSelected) ||
          (this.selectedTabId !== 'wallet')) {
            //this.sharedService.showModalOverview();
            // Populate Withdraw Model
            //this.withdrawModel.address = this.recipient;
            this.withdrawModel.emailAddress = this.emailAddress;
            //this.withdrawModel.grxAmount = +this.withdrawValue;
            this.withdrawModel.memoMessage = this.memoMessage;
            this.withdrawModel.phoneNumber = this.phoneNumber;
            //this.withdrawModel.xlmAmount = +this.XLMValue;
            this.withdrawModel.amount = +this.withdrawValue;
            this.withdrawModel.asset = this.selectedAssestTabId
            this.authService.userData.withdraw = true
            this.popupService.close()
            .then(() => {
              setTimeout(() => {
                this.sharedService.setWithdrawModel(this.withdrawModel);
                this.router.navigate(['/wallet/overview', {outlets: {popup: 'review-withdraw'}}]);
              }, 50);
            })            
        }
      }      
    })    
  }

  private showOrHideUIElements() {
    this.isMemoMessageSelected = (this.memoMessage !== null) && (this.memoMessage !== '');
    if (this.noMemoMessageSelected) {
      this.memoMessage = null;
    }
  }
  
  KeyUp(asset:string){
    this.errorService.clearError()
    if (asset == 'grx'){
      if (!this.isValidNumber(this.withdrawValue)){    
        this.usdValue = null
        return
      }
      if (this.withdrawValue && +this.withdrawValue > this.authService.getMaxAvailableGRX()){
        this.errorService.handleError(null, 'The amount entered exceeds the maximum available balance!');   
        return    
      }
      this.usdValue = (+this.withdrawValue*this.authService.priceInfo.xlmusd*this.authService.priceInfo.xlmgrx).toFixed(5)
    } else if (asset == 'xlm'){
      if (!this.isValidNumber(this.withdrawValue)){    
        this.usdValue = null
        return
      }
      if (this.withdrawValue && +this.withdrawValue > this.authService.getMaxAvailableXLM()){
        this.errorService.handleError(null, 'The amount entered exceeds the maximum available balance!');  
        return     
      } 
      this.usdValue = (+this.withdrawValue*this.authService.priceInfo.xlmusd).toFixed(5)
    }
  }

  clientValidation() {
    return new Promise(resolve => {
      if (!this.recipient) {
        this.errorService.handleError(null, 'Please enter a valid Stellar Account or Federation Address!');
        resolve(false)
        return
      }
      this.isValidAddress(this.recipient).then(valid => {       
        if (!valid){
          resolve(false)
        }
  
        if (this.selectedTabId === 'phone' && !this.phoneNumber || (this.phoneNumber && !this.isValidPhoneNumber(this.phoneNumber))) {
        this.errorService.handleError(null, 'Please enter a valid phone number!');
        resolve(false)
        }
        if (this.selectedTabId === 'email' && !this.emailAddress) {
          this.errorService.handleError(null, 'Please enter a valid email address!');
          resolve(false)
        }
        // if ((!this.withdrawValue && !this.XLMValue) || (this.withdrawValue && !this.isValidNumber(this.withdrawValue))) {
        //   this.errorService.handleError(null, 'Please enter a valid GRX amount!');
        //   resolve(false)
        // }
        if (this.selectedTabId !== 'wallet' && !this.memoMessage) {
          this.errorService.handleError(null, 'Please enter a memo message!');
          resolve(false)
        }

        //validate the withdraw value
        if (!this.withdrawValue || (this.withdrawValue && !this.isValidNumber(this.withdrawValue))) {
          this.errorService.handleError(null, 'Please enter a valid amount!');
          resolve(false)
        }
        if (this.selectedAssestTabId === 'GRX'){
          if (this.withdrawValue && +this.withdrawValue > this.authService.getMaxAvailableGRX()){
            this.errorService.handleError(null, 'The amount entered exceeds the maximum available balance!');
            resolve(false)
          }
        } else if (this.selectedAssestTabId === 'XLM'){
          if (this.withdrawValue && +this.withdrawValue > this.authService.getMaxAvailableXLM()){
            this.errorService.handleError(null, 'The amount entered exceeds the maximum available balance!');
            resolve(false)
          }         
        }
                
        resolve(true)
      })
    })    
  }

  private isValidNumber(value: string): boolean {
    if (value == '' || value == null){
      return false
    }
    const num = Number(value);
    return !isNaN(num);
  }

  isValidPhoneNumber(value: string): boolean {
    return this.isValidNumber(value.replace('+', ''));
  }

  isValidAddress(value: string) {
    return new Promise(resolve => {
      let msg = ''
      let valid = false
      if (value.startsWith('G') && value.length === 56){
        this.stellarService.validateAccount(value).then(ret => {
          if (ret == -1){
            msg = 'Destination account address does not exist.'
          } else if(ret == -2){
            if (this.selectedAssestTabId == 'GRX'){
              msg = 'Destination account address does not have a GRX trustline!'
            } else {
              valid = true
            }
          } else if (ret == 0){
            valid = true            
          }
          if (!valid){
            this.errorService.handleError(null, msg)
          }
          this.withdrawModel.address = value
          resolve(valid)
        })      
      } else if (value.includes('*') && value.includes('.')){
        this.stellarService.getAccountFromFed(value)
        .then(accId => {          
          this.withdrawModel.address = accId.toString()
          resolve( true)
        }).catch( err => {
          console.log(err)
          this.errorService.handleError(null, 'The federation address does not exist.')         
          resolve(false)
        })
      } else {
        this.errorService.handleError(null, 'Please enter a valid Stellar Account or Federation Address!')
        resolve(false)
      }
    })     
  }
}
