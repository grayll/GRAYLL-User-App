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
  GRXValue: string;
  memoMessage: string;
  recipient: string;
  selectedTabId: string;
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

  // countryCodes = [
  //   'af', 'al', 'dz', 'as', 'ad', 'ao', 'ai', 'aq', 'ag', 'ar', 'am', 'aw', 'au', 'at', 'az', 'bs', 'bh', 'bd', 'bb', 'by', 'be', 'bz',
  //   'bj', 'bm', 'bt', 'bo', 'ba', 'bw', 'bv', 'br', 'io', 'bn', 'bn', 'bg', 'bf', 'bi', 'kh', 'cm', 'ca', 'cv', 'ky', 'cf', 'td', 'cl',
  //   'cn', 'cx', 'cc', 'co', 'km', 'cg', 'ck', 'cr', 'ci', 'ci', 'hr', 'cu', 'cy', 'cz', 'dk', 'dj', 'dm', 'do', 'ec', 'eg', 'sv', 'gq',
  //   'er', 'ee', 'et', 'fk', 'fo', 'fj', 'fi', 'fr', 'gf', 'pf', 'tf', 'ga', 'gm', 'ge', 'de', 'gh', 'gi', 'gr', 'gl', 'gd', 'gp', 'gu',
  //   'gt', 'gg', 'gn', 'gw', 'gy', 'ht', 'hm', 'va', 'hn', 'hk', 'hu', 'is', 'in', 'id', 'iq', 'ie', 'im', 'il', 'it', 'jm', 'jp', 'je',
  //   'jo', 'kz', 'ke', 'ki', 'kr', 'kw', 'kg', 'la', 'lv', 'lb', 'ls', 'lr', 'ly', 'ly', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'my', 'mv',
  //   'ml', 'mt', 'mh', 'mq', 'mr', 'mu', 'yt', 'mx', 'mc', 'mn', 'me', 'ms', 'ma', 'mz', 'mm', 'mm', 'na', 'nr', 'np', 'nl', 'an', 'nc',
  //   'nz', 'ni', 'ne', 'ng', 'nu', 'nf', 'mp', 'no', 'om', 'pk', 'pw', 'pa', 'pg', 'py', 'pe', 'ph', 'pn', 'pl', 'pt', 'pr', 'qa', 're',
  //   'ro', 'ru', 'ru', 'rw', 'kn', 'lc', 'pm', 'vc', 'vc', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 'sc', 'sl', 'sg', 'sk', 'si', 'sb',
  //   'so', 'za', 'gs', 'es', 'lk', 'sd', 'sr', 'sj', 'sz', 'se', 'ch', 'sy', 'tw', 'tj', 'th', 'tl', 'tg', 'tk', 'to', 'tt', 'tt', 'tn',
  //   'tr', 'tm', 'tc', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'um', 'uy', 'uz', 'vu', 've', 'vn', 'vn', 'wf', 'eh', 'ye', 'zm', 'zw'
  // ];

  constructor(
    public popupService: PopupService,
    private sharedService: SharedService,
    private router: Router,
    private errorService: ErrorService,
    private authService: AuthService,
    private stellarService: StellarService,
  ) {
    if (this.authService.userData.totalXLM){
      this.totalXLM = this.authService.userData.totalXLM;
    } else {
      this.totalXLM = 0
    }
    if (this.authService.userData.totalGRX){
      this.totalGRX = this.authService.userData.totalGRX;
    } else {
      this.totalGRX = 0
    }
    this.XLMValue = '';
    this.memoMessage = null;
    this.GRXValue = '';
    this.recipient = null;
    this.withdrawModel = new WithdrawModel();
    this.isMemoMessageSelected = true;

    this.xlmPrice = this.authService.userData.xlmPrice
    this.grxPrice = this.authService.userData.grxPrice
    this.authService.GetOpenOrder()
  }

  ngOnInit() {
    this.selectedCountryCode = 'af';
    this.popupService.open(this.modal);
    this.selectedTabId = 'wallet';
  }

  onTabChange(id: string) {
    this.selectedTabId = id;
  }

  populateMaxGRX() {
    this.GRXValue = this.totalGRX.toString();
  }

  populateMaxXLM() {
    //this.XLMValue = (this.totalXLM - 1.5 - (+this.authService.userData.OpenOrders)).toString()
    this.XLMValue = this.authService.getMaxAvailableXLM().toFixed(7)
  }
  getMaxXLMForTrade(){
    if (this.authService.getMaxAvailableXLM() - 0.500011 > 0){
      return (this.authService.getMaxAvailableXLM() - 0.500011).toFixed(7)
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
            this.withdrawModel.grxAmount = +this.GRXValue;
            this.withdrawModel.memoMessage = this.memoMessage;
            this.withdrawModel.phoneNumber = this.phoneNumber;
            this.withdrawModel.xlmAmount = +this.XLMValue;
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

  clientValidation() {
    return new Promise(resolve => {
      if (!this.recipient) {
        this.errorService.handleError(null, 'Please enter a valid Stellar Account or Federation Address!');
        resolve(false)
        return
      }
      this.isValidAddress(this.recipient).then(valid => {
        console.log('clientValidation', valid)
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
        if ((!this.GRXValue && !this.XLMValue) || (this.GRXValue && !this.isValidNumber(this.GRXValue))) {
          this.errorService.handleError(null, 'Please enter a valid GRX amount!');
          resolve(false)
        }
        if (this.selectedTabId !== 'wallet' && !this.memoMessage) {
          this.errorService.handleError(null, 'Please enter a memo message!');
          resolve(false)
        }
        if ((!this.XLMValue && !this.GRXValue) || (this.XLMValue && !this.isValidNumber(this.XLMValue))) {
          this.errorService.handleError(null, 'Please enter a valid XLM amount!');
          resolve(false)
        }
        if ((this.XLMValue && +this.XLMValue > this.authService.getMaxAvailableXLM()) || (this.GRXValue && +this.GRXValue > this.authService.getMaxAvailableGRX())) {
          this.errorService.handleError(null, 'The amount entered exceeds the maximum available balance!');
          resolve(false)
        }
        
        resolve(true)
      })
    })    
  }

  isValidNumber(value: string): boolean {
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
            msg = 'Destination account address does not have a GRX trustline!'
          } else if (ret == 0){
            valid = true
          }
          if (!valid){
            this.errorService.handleError(null, msg)
          }
          return resolve(valid)
        })      
      }
      if (value.includes('*') && value.includes('.')){
        this.stellarService.getAccountFromFed(value)
        .then(accId => {          
          this.withdrawModel.address = accId.toString()
          resolve( true)
        }).catch( err => {
          console.log(err)
          this.errorService.handleError(null, 'The federation address does not exist.')         
          resolve(false)
        })
      }
      this.errorService.handleError(null, 'Please enter a valid Stellar Account or Federation Address!')
    })     
  }
}
