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
import { AlgoService } from 'src/app/system/algo.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from 'src/app/shared/services/loading.service';

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

  // XLMValueForm:number
  // USDValueForm:number
  
  grxTradeValue: number

  grxP: number
  xlmP: number = 1
  action: string = ''

  
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
  xlmAmount: string = ''
  usdValue: string = ''
  
  SecKey: string = ''
  fieldName: string = ''
  tabId: string = 'buy'
  
  private subs = new SubSink();

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private router: Router,
    private stellarService: StellarService,
    public authService: AuthService,
    public push: SwPush,
    public popupService: PopupService,
    public algoService: AlgoService,
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {
    
    // this.grxP = this.authService.priceInfo.xlmgrx
    // this.xlmP = this.authService.userData.xlmPrice

    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress = this.authService.userData.PublicKey;
    this.secretKey = '';   
    if (!this.stellarService.allOffers){
      this.stellarService.allOffers = []
    }
    //console.log('this.stellarService.allOffers:', this.stellarService.allOffers)
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
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  executeBuy(){     
    this.loadingService.show()
    var dexAmount = +this.grxAmount
    var superAdminAmount = 0
    if (this.authService.userInfo.SellingPercent <= 100){
      dexAmount = this.authService.userInfo.SellingPercent*+this.grxAmount/100
      superAdminAmount = +this.grxAmount - dexAmount
    }
    
    // check setting whether direct purchase on admin account
   // console.log('grxPrice:', this.grxPrice , this.authService.priceInfo.xlmgrx , this.authService.userInfo.SellingPrice)
    //console.log('grxPrice:', this.authService.userInfo.SellingWallet , this.authService.userInfo.SellingPercent, dexAmount, superAdminAmount)
    if (+this.grxPrice > this.authService.priceInfo.xlmgrx_ask && +this.grxPrice >= this.authService.userInfo.SellingPrice){
      if (superAdminAmount > 0 && this.authService.userInfo.SellingWallet && this.authService.userInfo.SellingWallet != ''){        
        console.log('Direct purchase from super admin', this.authService.userInfo.SellingWallet,this.authService.getSecretKey())
        // purchase directly from grayll super admin        
        if (superAdminAmount > 0){
          // buy all from grayll super admin
          let xlmAmount = superAdminAmount*+this.grxPrice
          //console.log('xlmAmount:', xlmAmount)
          this.stellarService.sendAsset(this.authService.getSecretKey(), this.authService.userInfo.SellingWallet, 
            xlmAmount.toFixed(7), this.stellarService.nativeAsset, '')
          .then( txHash => {
            this.authService.verifyTx(txHash, 'buying', {grxPrice:+this.grxPrice, grxAmount: superAdminAmount, xlmAmount:+xlmAmount.toFixed(7), 
              grxUsd:+this.grxPrice*this.authService.priceInfo.xlmusd, totalUsd:+xlmAmount.toFixed(7)*this.authService.priceInfo.xlmusd}).then(resp => {
              // update fund
              //console.log('verifyTx: ', resp)
              this.loadingService.hide()
              let msg 
              if (resp.errCode === environment.SUCCESS){
                msg = 'Buy order has been matched and executed!'                   
              } else {
                msg = 'Buy order could not be submitted! Please retry!'             
              }

              this.loadingService.hide()
              this.snotifyService.simple(msg); 
            }).catch( e => {
              console.log(e)
              this.loadingService.hide()
            })              
          }).catch(e => {
            console.log(e)
            let msg = 'Buy order could not be submitted. Please retry!'   
            this.snotifyService.simple(msg);        
            this.loadingService.hide()
          })            
          //return
        } 
      }
    } else {
      dexAmount = +this.grxAmount
    }

    if (dexAmount > 0){
      //console.log('dexAmount.toString()', dexAmount.toString())
      this.stellarService.buyOrder(this.authService.getSecretKey(), this.grxPrice, dexAmount.toFixed(7)).then( res => {
        //console.log(res)
        if (!this.stellarService.allOffers){
          this.stellarService.allOffers = []
        }
        let matchType = 0
        let msg = 'Buy order submitted successfully.'
        if (res.offerResults[0].currentOffer){
          //console.log('res.offerResults[0].currentOffer', res.offerResults[0].currentOffer)
          let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
            this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userMetaStore)

          this.stellarService.allOffers.push(of)                 
          this.authService.userMetaStore.OpenOrders = this.authService.userMetaStore.OpenOrders + 1
          matchType += 1
                
        } 
        if (res.offerResults[0].offersClaimed && res.offerResults[0].offersClaimed.length > 0) {
          //console.log('res.offerResults', res.offerResults)
          this.stellarService.parseClaimedOffer(res.offerResults[0].offersClaimed,this.grxPrice,this.xlmP, this.authService.userMetaStore)
          matchType += 2
        }
        if (matchType == 3){
          msg = 'Buy order has been partially matched and executed!'            
        } else if (matchType == 2){
          msg = 'Buy order has been matched and executed!'          
        }
        if (matchType > 0){
          this.authService.updateUserMeta(true)
        }
        this.loadingService.hide()
        this.snotifyService.simple(msg); 
        
      }).catch(e => {
        console.log(e)
        this.loadingService.hide()
        if (e.toString().includes('status code 400')){
          this.snotifyService.simple('Insufficient funds to submit this buy order! Please add more funds to your account.')  
        } else {
          this.snotifyService.simple('Buy order could not be submitted. Please retry!')
        } 
      })  
    }     
  }
  
  verifyTx(ledger){
    this.http.post(`api/v1/users/txverify`, {ledger: ledger, action:'buying'})    
    .subscribe(
      resp => {
        //console.log(resp)        
      },
      err => {
        console.log('verify ledger exp: ', err)       
      } 
    )    
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
    if (maxAvailabeXLM < 0){
      this.snotifyService.simple('Insufficient funds to submit this buy order! For each sell order you place 0.5 XLM is reserved from your account balance. Please add more XLM to your account.')
        
      return false
    }

    if (+this.grxAmount*+this.grxPrice > maxAvailabeXLM){
      console.log('buyGrx:', +this.grxAmount*+this.grxPrice, maxAvailabeXLM)
      this.snotifyService.simple('Insufficient funds to submit this buy order! Please add more funds to your account.')
        
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
     
    return true  
  }
  executeSell(){    
    this.loadingService.show()
    this.stellarService.sellOrder(this.authService.getSecretKey(), (+this.grxPrice).toFixed(7), (+this.grxAmount).toFixed(7)).then( res => {    
      let matchType = 0
      let msg = 'Sell order submitted successfully.' 
     // console.log('executeSell-res:', res)   
      if (res.offerResults[0].currentOffer){   
        //console.log('executeSell-res.offerResults[0].currentOffer:', res.offerResults[0].currentOffer)     
        if (!this.stellarService.allOffers){
          this.stellarService.allOffers = []
        }     
        let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
        this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userMetaStore)
        this.stellarService.allOffers.push(of)    
        //console.log('this.stellarService.allOffers:', this.stellarService.allOffers)             
        this.authService.userMetaStore.OpenOrders = this.authService.userMetaStore.OpenOrders + 1
        matchType += 1 
      } 
      if (res.offerResults[0].offersClaimed && res.offerResults[0].offersClaimed.length > 0) {
        //console.log('executeSell-res.offerResults[0].offersClaimed:', res.offerResults[0].offersClaimed)   
        this.stellarService.parseClaimedOffer(res.offerResults[0].offersClaimed, this.grxPrice, this.xlmP, this.authService.userMetaStore)         
        matchType += 2        
      } 

      this.authService.reload = false
      if (matchType == 3){
        msg = 'Sell order has been partially matched and executed!'
      } else if (matchType == 2){
        msg = 'Sell order has been matched and executed!'
      }
      if (matchType > 0){
        this.authService.updateUserMeta(true) 
      }
      this.loadingService.hide()
      this.snotifyService.simple(msg);  

      //             
    }).catch(e => {
      console.log(e)
      this.loadingService.hide()
      
      if (e.toString().includes('status code 400')){
        this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')  
      } else {
        this.snotifyService.simple('Sell order could not be submitted! Please retry.')  
      }  
    })       
  }

  // 

  validateSellAbility(){
    let maxAvailabeXLM = this.authService.getMaxAvailableXLM() - this.reservedTrade
    let maxAvailabeGRX = this.authService.getMaxAvailableGRX()

    if (maxAvailabeXLM < 0){
      this.snotifyService.simple(`Insufficient funds to submit this sell order! For each buy order you place 0.5 XLM is reserved from your account balance.
        Please add more XLM to your account.`)
        
      return false 
    }

    if (+this.grxAmount > maxAvailabeGRX){
      //console.log('sellGrx:', +this.grxAmount , maxAvailabeGRX)
      this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')  
        
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
  // reInitVariables(){
  //   this.isPopulateMaxGRX = false
  //   this.isPopulateMaxXLM = false     
  // } 
  onTabChange(id: string) { 
    this.tabId = id   
  } 

  checkFunds(){
    if (this.tabId == 'buy'){//buy GRX
      if (+this.xlmAmount > +this.getMaxXLMForTrade()){
        this.snotifyService.simple('Insufficient funds to submit this buy order! Please add more funds to your account.') 
      } 
    } else if (this.tabId == 'sell'){ // sell GRX
      if (+this.grxAmount > +this.authService.getMaxAvailableGRX()){
        this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.') 
      }
    }
  }
 
  KeyUp(fieldName:string){
    this.fieldName = fieldName   
   
    switch(fieldName){     
      case 'grxamount':        
        if (!this.isValidNumber(this.grxAmount)){         
          this.usdValue = null
          this.xlmAmount = null
          return
        }
        
        if (this.isValidNumber(this.grxPrice) && this.isValidNumber(this.grxAmount)){             
          this.xlmAmount = (+this.grxAmount * +this.grxPrice).toFixed(7)
          this.usdValue = (+this.grxAmount * +this.grxPrice * this.authService.priceInfo.xlmusd).toFixed(7)
          this.checkFunds()
        } else if (this.isValidNumber(this.grxAmount)){
          if (this.isValidNumber(this.xlmAmount) || this.isValidNumber(this.usdValue)){
            this.grxPrice = (+this.xlmAmount/+this.grxAmount).toFixed(7)
          }
        } else if (this.isValidNumber(this.grxPrice)){
          if (this.isValidNumber(this.xlmAmount) || this.isValidNumber(this.usdValue)){
            this.grxAmount = (+this.xlmAmount/+this.grxPrice).toFixed(7)
          }
        }
        break
      case 'grxprice':  
      if (this.grxPrice == null){        
        this.usdValue = null
        this.xlmAmount = null
        return
      }      
        if (this.isValidNumber(this.grxPrice) && this.isValidNumber(this.grxAmount)){           
          this.xlmAmount = (+this.grxAmount * +this.grxPrice).toFixed(7)
          this.usdValue = (+this.grxAmount * +this.grxPrice * this.authService.priceInfo.xlmusd).toFixed(7)
          this.checkFunds()
        } else if (this.isValidNumber(this.grxAmount)){          
          if (this.isValidNumber(this.xlmAmount) || this.isValidNumber(this.usdValue)){            
            this.grxPrice = (+this.xlmAmount/+this.grxAmount).toFixed(7)
          }
        } else if (this.isValidNumber(this.grxPrice)){           
          if (this.isValidNumber(this.xlmAmount) || this.isValidNumber(this.usdValue)){           
            this.grxAmount = (+this.xlmAmount/+this.grxPrice).toFixed(7)
          }
        }
        break
      case 'xlmamount':    
        if (!this.isValidNumber(this.xlmAmount)){    
          this.usdValue = null
          return
        }
        this.usdValue = (+this.xlmAmount*this.authService.priceInfo.xlmusd).toFixed(7) 
        
        if (this.isValidNumber(this.grxPrice)){          
          this.grxAmount = (+this.xlmAmount / +this.grxPrice).toFixed(5)          
          this.usdValue = (+this.xlmAmount*this.authService.priceInfo.xlmusd).toFixed(7)          
        } else if (this.isValidNumber(this.grxAmount)){
          this.grxPrice = (+this.grxAmount/(+this.grxAmount)).toFixed(7)
          this.usdValue = (+this.xlmAmount*this.authService.priceInfo.xlmusd).toFixed(7)
        }
        this.checkFunds() 
        break
      case 'usdvalue':   
        if (!this.isValidNumber(this.usdValue)){    
          this.xlmAmount = null
          return
        }
        this.xlmAmount = (+this.usdValue/this.authService.priceInfo.xlmusd).toFixed(7) 
        if (this.isValidNumber(this.grxPrice) ){
          this.grxAmount = (+this.xlmAmount / +this.grxPrice).toFixed(7)              
        } else if (this.isValidNumber(this.grxAmount)){
          this.grxPrice = (+this.xlmAmount/(+this.grxAmount)).toFixed(7) 
        }
        this.checkFunds()   
        break
    }
  }
  
  populateMaxXLM() {
    //this.isPopulateMaxGRX = false
    if (this.authService.getMaxAvailableXLM() - this.reservedTrade > 0){
      //this.isPopulateMaxXLM = true
      this.xlmAmount = (this.authService.getMaxAvailableXLM() - this.reservedTrade).toFixed(5)
      //this.grxPrice = this.bidPrice.toFixed(7)  
      this.grxPrice =  this.authService.priceInfo.xlmgrx_bid.toFixed(7)
      this.grxAmount = (+this.xlmAmount/+this.grxPrice).toFixed(7)
      this.usdValue = (+this.xlmAmount*this.authService.priceInfo.xlmusd).toFixed(7)
    } else {
      this.snotifyService.simple('Insufficient funds to submit this sell order! Please add more funds to your account.')    
    }
  }

  populateMaxGRX() {
    //this.isPopulateMaxXLM = false
    if (this.authService.getMaxAvailableGRX() > 0){
      //this.isPopulateMaxGRX = true
      this.grxAmount = this.authService.getMaxAvailableGRX().toFixed(7)  
      
      this.grxPrice =  this.authService.priceInfo.xlmgrx_ask.toFixed(7)  
      this.xlmAmount = (+this.grxAmount*+this.grxPrice).toFixed(7)
      this.usdValue = (+this.xlmAmount*this.authService.priceInfo.xlmusd).toFixed(7)
    }
  }
  
  private isValidNumber(value: string): boolean {
    if (value == '' || value == null){
      return false
    }
    const num = Number(value);
    return !isNaN(num);
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

  
}
