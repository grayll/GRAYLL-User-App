import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {faChartLine, faCircle, faWallet} from '@fortawesome/free-solid-svg-icons';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import {SubSink} from 'subsink';
import {SettingsService} from '../../settings/settings.service';
import {Router} from '@angular/router';
import { StellarService } from '../../authorization/services/stellar-service';
import { AuthService } from "../../shared/services/auth.service"
import { environment } from 'src/environments/environment'
import axios from 'axios'
import { SwUpdate, SwPush } from '@angular/service-worker';
import {PopupService} from 'src/app/shared/popup/popup.service';

@Component({
  selector: 'app-wallet-stats',
  templateUrl: './wallet-stats.component.html',
  styleUrls: ['./wallet-stats.component.scss']
})
export class WalletStatsComponent implements OnInit, OnDestroy {

  @ViewChild(NgbCarousel) carouselWallet;

  faWallet = faWallet;
  faCircle = faCircle;
  faChartLine = faChartLine;
  federationAddress: string;
  stellarAddress: string;
  isPopulateMaxXLM: boolean = false
  isPopulateMaxGRX: boolean = false

  reservedTrade : number = 0.500011

  XLMValueForm:number
  USDValueForm:number

  //xlmTradeValue: number
  grxTradeValue: number

  grxP: number
  xlmP: number = 1
  action: string = ''

  // totalXLM: number;
  // totalGRX: number;
  gryBalance: number;
  grzBalance: number;
  algoWalletValue: string;
  algoWalletBalance: number;
  gryValue: string;
  grzValue: string;
  gryUsdValue: string;
  grzUsdValue: string;

  maxAvailabeXLM: number
  maxAvailabeGRX: number

  secretKey: string;
  isSecretKeyRevealed: boolean;

  // offers
  grxAmount: string = ''
  grxPrice: string = ''
  // grxXlmEqui: string = ''
  // grxUsdEqui: string = ''
  SecKey: string = ''

  askPrice: number = 0;
  bidPrice: number = 0;

  private subs = new SubSink();

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private router: Router,
    private stellarService: StellarService,
    private authService: AuthService,
    public push: SwPush,
    public popupService: PopupService,
  ) {
    
    this.grxP = this.authService.userData.grxPrice
    this.xlmP = this.authService.userData.xlmPrice

    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress = this.authService.userData.PublicKey;
    this.secretKey = '';   
    if (!this.stellarService.allOffers){
      this.stellarService.allOffers = []
    }
    console.log('this.stellarService.allOffers:', this.stellarService.allOffers)
    this.subs.add(this.popupService.observeValidation().subscribe(valid => {
      if (valid){
        if (this.action === 'buy'){
          this.executeBuy()
        } else if (this.action === 'sell'){
          this.executeSell()
        }
      }
    }))    
  }

  getMaxXLMForTrade(){
    if (this.authService.getMaxAvailableXLM() - this.reservedTrade > 0){
      return (this.authService.getMaxAvailableXLM() - this.reservedTrade).toFixed(7)
    } else {
      return '0'
    }
  }
  
  ngOnInit() {
    this.observeRevealSecretKey();
    // get ask, bid, last prices
    axios.get(environment.ask_bid_prices)
    .then( res => {
      this.askPrice = res.data.asks[0].price_r.d/res.data.asks[0].price_r.n
      this.bidPrice = res.data.bids[0].price_r.d/res.data.bids[0].price_r.n
    })
    .catch(e => {
      console.log('can not get ask/bid price: ', e)
    })
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  executeBuy(){
    if (!this.validateBuyAbility()){
      return
    } 
    this.authService.GetSecretKey(null).then(SecKey => {    
      console.log('this.stellarService.allOffers:', this.stellarService.allOffers) 
      this.stellarService.buyOrder(SecKey, this.grxPrice, this.grxAmount).then( res => {
        if (!this.stellarService.allOffers){
          this.stellarService.allOffers = []
        }
        let matchType = 0
        let msg = 'Buy order submitted successfully.'
        if (res.offerResults[0].currentOffer){
          console.log('res.offerResults[0].currentOffer', res.offerResults[0].currentOffer)
          let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
            this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userData)

          this.stellarService.allOffers.push(of)                   
          if (this.authService.userData.OpenOrders){
            this.authService.userData.OpenOrders = +this.authService.userData.OpenOrders + 1
          } else {
            this.authService.userData.OpenOrders = 1
          }
          this.authService.SetLocalUserData()
          matchType += 1
        } 
        if (res.offerResults[0].offersClaimed && res.offerResults[0].offersClaimed.length > 0) {
          console.log('res.offerResults', res.offerResults)
          this.stellarService.parseClaimedOffer(res.offerResults[0].offersClaimed,this.grxPrice,this.xlmP, this.authService.userData)          
          matchType += 2
        }
        if (matchType == 3){
          msg = 'Buy order has been partially matched and executed!'
        } else if (matchType == 2){
          msg = 'Buy order has been matched and executed!'
        }
        this.snotifyService.simple(msg); 
      }).catch(e => {
        console.log(e)
        if (e.toString().includes('status code 400')){
          this.snotifyService.simple('Insufficient funds to submit this buy order! Please add more funds to your account.')  
        } else {
          this.snotifyService.simple('Buy order could not be submitted! Please retry!')
        } 
      })        
    })  
  }
  buyGrx(){    
    this.action = 'buy'
    if(!this.validateSession()){
      return
    } 
    if (!this.validateBuyAbility()){
      return
    } 
    this.executeBuy()  
    this.action = ''  
  }
  validateBuyAbility(){
    let maxAvailabeXLM = this.authService.getMaxAvailableXLM() - this.reservedTrade
    if (+this.grxAmount*+this.grxPrice > maxAvailabeXLM || maxAvailabeXLM < 0){
      console.log('buyGrx:', +this.grxAmount*+this.grxPrice, maxAvailabeXLM)
      this.snotifyService.simple('Insufficient funds to submit this buy order! Please add more funds to your account.')
      this.reInitVariables()    
      return false
    }
    return true
  }
  validateSession(){
    if (this.authService.isTokenExpired()){
      this.snotifyService.simple('Your login session has expired! Please login again.'); 
      this.router.navigateByUrl('/login')
      return false
    } 
    if (!this.authService.hash || this.authService.userInfo.Setting.MulSignature){
      console.log('!this.authService.hash')
      this.router.navigate(['/wallet/overview', {outlets: {popup: 'input-password'}}]);
      return false
    }  
    return true  
  }
  executeSell(){
    if (!this.validateSellAbility()){
      return
    }
    this.authService.GetSecretKey(null).then(SecKey => {      
      this.stellarService.sellOrder(SecKey, this.grxPrice, this.grxAmount).then( res => {    
        let matchType = 0
        let msg = 'Buy order submitted successfully.'    
        if (res.offerResults[0].currentOffer){          
          let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
            this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userData)
          this.stellarService.allOffers.unshift(of)          
          if (this.authService.userData.OpenOrders){
            this.authService.userData.OpenOrders = +this.authService.userData.OpenOrders +1
          } else {
            this.authService.userData.OpenOrders = 1
          }
          this.authService.SetLocalUserData()
          this.snotifyService.simple('Sell order submitted successfully!'); 
          matchType += 1
        } 
        if (res.offerResults[0].offersClaimed && res.offerResults[0].offersClaimed.length > 0) {
          this.stellarService.parseClaimedOffer(res.offerResults[0].offersClaimed, this.grxPrice, this.xlmP, this.authService.userData)         
          matchType += 2
        } 

        if (matchType == 3){
          msg = 'Sell order has been partially matched and executed!'
        } else if (matchType == 2){
          msg = 'Sell order has been matched and executed!'
        }

        this.snotifyService.simple(msg); 

        this.reInitVariables()             
      }).catch(e => {
        console.log(e)
        this.reInitVariables()
        if (e.toString().includes('status code 400')){
          this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')  
        } else {
          this.snotifyService.simple('Sell order could not be submitted! Please retry.')  
        }  
      })        
    }).catch( err => {
      console.log(err)
    })
  }
  validateSellAbility(){
    let maxAvailabeXLM = this.authService.getMaxAvailableXLM() - this.reservedTrade
    let maxAvailabeGRX = this.authService.getMaxAvailableGRX()

    if (+this.grxAmount > maxAvailabeGRX || maxAvailabeXLM < 0){
      console.log('sellGrx:', +this.grxAmount , maxAvailabeGRX)
      this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')  
      this.reInitVariables()  
      return false
    }
    return true
  }
  sellGrx(){
    this.action = 'sell'   
    if(!this.validateSession()){
      return
    }  
    if (!this.validateSellAbility()){
      return
    }
    
    this.executeSell()
    this.action = ''    
  }

  copyFederationAddress() {
    if (this.clipboardService.copyFromContent(this.federationAddress)) {
      this.snotifyService.simple('Federation address copied.');
    }
  }

  copyStellarAddress() {
    if (this.clipboardService.copyFromContent(this.stellarAddress)) {
      this.snotifyService.simple('Stellar address copied.');
    }
  }

  revealSecretKey() {    
    this.router.navigate(['/wallet/overview', {outlets: {popup: 'reveal-secret-key'}}]);
  }

  hideSecretKey() {
    this.isSecretKeyRevealed = false;
  }

  observeRevealSecretKey() {
    this.subs.add(this.settingsService.observeConfirmAuthority()
    .subscribe((secretKey) => {     
      this.isSecretKeyRevealed = true;      
      this.secretKey = secretKey
    }));
  }
  reInitVariables(){
    this.isPopulateMaxGRX = false
    this.isPopulateMaxGRX = false     
  } 
  onTabChange(id: string) {    
    this.isPopulateMaxXLM = false
    this.isPopulateMaxGRX = false
    // switch (id){
    // }
  } 
  calGRXAmount(){   
    if (this.isPopulateMaxGRX && this.grxPrice){            
      this.grxAmount = this.authService.getMaxAvailableGRX().toString()      
      return ((+this.grxAmount)*(+this.grxPrice)).toFixed(7)
    } else if(!this.isPopulateMaxGRX && this.grxPrice) {      
      return ((+this.grxAmount)*(+this.grxPrice)).toFixed(7)
    }
  }
  calXLMAmount(){     
    if (this.isPopulateMaxXLM && this.grxPrice){     
      this.XLMValueForm = +this.getMaxXLMForTrade()
      this.grxAmount = (this.XLMValueForm/+this.grxPrice).toFixed(7)       
      return this.XLMValueForm
    } else {      
      return (+this.grxAmount)*(+this.grxPrice)
    }
  }
  populateMaxXLM() {
    this.isPopulateMaxGRX = false
    if (this.authService.getMaxAvailableXLM() - this.reservedTrade > 0){
      this.isPopulateMaxXLM = true
      this.XLMValueForm = this.authService.getMaxAvailableXLM() - this.reservedTrade
      this.grxPrice = this.bidPrice.toString()
      this.grxAmount = (this.XLMValueForm/+this.grxPrice).toFixed(7)
    } else {
      this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')    
    }    
  }

  populateMaxGRX() {
    this.isPopulateMaxXLM = false
    if (this.authService.getMaxAvailableGRX() > 0){
      this.isPopulateMaxGRX = true
      this.grxAmount = this.authService.getMaxAvailableGRX().toString()
      this.grxPrice = this.askPrice.toString()    
      this.XLMValueForm = +(+this.grxAmount*+this.grxPrice).toFixed(7)
    }
  }

  goToTop() {
    window.scroll(0, 0);
  }

  swipeLeft() {
    this.carouselWallet.next();
  }

  swipeRight() {
    this.carouselWallet.prev();
  }

// offerResults: Array(1)
// 0:
// amountBought: "402.8755023"
// amountSold: "999.9999999"
// currentOffer: undefined
// effect: "manageOfferDeleted"
// isFullyOpen: false
// offersClaimed: Array(2)
// 0:
// amountBought: "999.9999999"
// amountSold: "402.8755023"
// assetBought: {type: "credit_alphanum4", assetCode: "GRXT", issuer: "GAKXWUADYNO67NQ6ET7PT2DSLE5QGGDTNZZRESXCWWYYA2UCLOYT7AKR"}
// assetSold: {type: "native", assetCode: "XLM", issuer: undefined}
// offerId: "2567143"
// sellerId: "GDZFX4EN567WTLU7NLSHRQ2FRCEAM7ITTFM3WDRXYE7QGRGMW247CI6R"
// __proto__: Object
// 1:
// amountBought: "0"
// amountSold: "0"
// assetBought: {type: "credit_alphanum4", assetCode: "GRXT", issuer: "GAKXWUADYNO67NQ6ET7PT2DSLE5QGGDTNZZRESXCWWYYA2UCLOYT7AKR"}
// assetSold: {type: "native", assetCode: "XLM", issuer: undefined}
// offerId: "1047396"
// sellerId: "GDZFX4EN567WTLU7NLSHRQ2FRCEAM7ITTFM3WDRXYE7QGRGMW247CI6R"
// __proto__: Object
// length: 2
// __proto__: Array(0)  
// operationIndex: 0
// wasImmediatelyDeleted: false
// wasImmediatelyFilled: true
// wasPartiallyFilled: false

}
