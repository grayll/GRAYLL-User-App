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
  totalXLM: number;
  totalGRX: number;
  xlmBalance: number;
  grxBalance: number;
  walletValue: string;
  walletBalance: number;
  XLMValue: string;
  GRXValue: string;
  XLMUsdValue: string;
  GRXUsdValue: string;

  //xlmTradeValue: number
  grxTradeValue: number

  grxP: number
  xlmP: number = 1

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
  grxXlmEqui: string = ''
  grxUsdEqui: string = ''
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
  ) {
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
    console.log('userdata:', this.authService.userData)
    console.log('wallet-OpenOrders', this.authService.userData.OpenOrders)
    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress = this.authService.userData.PublicKey;
    this.secretKey = '';

    this.subs.add(this.stellarService.observePrices().subscribe(prices => {
      this.grxP = prices[0]
      this.xlmP = prices[1]      
      this.stellarService.getBlFromAcc(this.stellarService.userAccount, res => {
        this.fillWalletData(res)
      })
    })) 
  }

  fillWalletData(res){
    this.authService.userData.totalGRX = res.grx;//this.totalGRX
    this.authService.userData.totalXLM = res.xlm;// this.totalXLM
    this.totalXLM = this.authService.userData.totalXLM
    this.totalGRX = this.authService.userData.totalGRX        
    this.maxAvailabeXLM = this.authService.userData.totalXLM - 1.5 - 
      this.authService.userData.OpenOrders*0.5 - this.authService.userData.OpenOrdersXLM
    this.maxAvailabeGRX = this.authService.userData.totalGRX - this.authService.userData.OpenOrdersGRX
 
    this.xlmBalance =  this.totalXLM*this.xlmP
    this.grxBalance = this.totalGRX*this.grxP*this.xlmP    
    this.walletBalance = this.xlmBalance + this.grxBalance
    this.walletValue = `$ ${this.walletBalance.toFixed(2)}`
    this.GRXValue = '' + Math.round(this.grxBalance*100/this.walletBalance)
    this.XLMValue = '' + (100 - +this.GRXValue)
    this.XLMUsdValue = `$ ${this.xlmBalance.toFixed(2)}`
    this.GRXUsdValue = `$ ${this.grxBalance.toFixed(2)}`
    this.authService.userData.xlmPrice = this.xlmP
    this.authService.userData.grxPrice = this.grxP
    this.authService.SetLocalUserData()     
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

  buyGrx(){    
    if (!this.authService.hash || this.authService.isTokenExpired()){
      this.snotifyService.simple('The working session is expired. Please login again!'); 
      this.router.navigateByUrl('/login')
      return
    }    
      
    this.authService.GetSecretKey(null).then(SecKey => {       
      console.log('grxPrice:', this.grxPrice)
      console.log('grxAmount:', this.grxAmount)
      //let grxOfPrice = +this.grxPrice/this.xlmP
      this.stellarService.buyOrder(SecKey, this.grxPrice, this.grxAmount).then( res => {
        if (res.offerResults[0].currentOffer){
          let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
            this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userData)

          this.stellarService.allOffers.push(of)
          this.snotifyService.simple('Buy order submitted successfully.')
          
          if (this.authService.userData.OpenOrders){
            this.authService.userData.OpenOrders +=1
          } else {
            this.authService.userData.OpenOrders = 1
          }
          this.authService.SetLocalUserData()
        } else {
          this.snotifyService.simple('Buy order is matched.'); 
        }
      }).catch(e => {
        console.log(e)
      })        
    })    
  }

  sellGrx(){   
    if (!this.authService.hash || this.authService.isTokenExpired()){
      this.snotifyService.simple('The working session is expired. Please login again!'); 
      this.router.navigateByUrl('/login')
      return
    } 
    this.authService.GetSecretKey(null).then(SecKey => {     
      //this.SecKey = SecKey
      //let grxOfPrice = +this.grxPrice/this.xlmP
      this.stellarService.sellOrder(SecKey, this.grxPrice, this.grxAmount).then( res => {
        console.log(res)
        if (res.offerResults[0].currentOffer){
          let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
            this.grxP, this.xlmP, this.stellarService.allOffers.length, this.authService.userData)
          this.stellarService.allOffers.push(of)
          //this.authService.SetOpenOrder(1)
          if (this.authService.userData.OpenOrders){
            this.authService.userData.OpenOrders +=1
          } else {
            this.authService.userData.OpenOrders = 1
          }
          this.authService.SetLocalUserData()
          this.snotifyService.simple('Sell order submitted successfully.'); 
        } else {
          this.snotifyService.simple('Sell order is matched.'); 
        }        
      }).catch(e => {
        console.log(e)
      })        
    }).catch( err => {
      console.log(err)
    })
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

  populateMaxXLM() {
    //this.XLMValue = (this.totalXLM - 1.5).toString();
    //(this.totalXLM - 1.5 - (+this.authService.GetOpenOrder())).toString()
  }

  populateMaxGRX() {
    //this.GRXValue = this.totalGRX.toString();
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
