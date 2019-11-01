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

  grxP: number
  xlmP: number

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

  secretKey: string;
  isSecretKeyRevealed: boolean;

  // offers
  grxAmount: string = ''
  grxPrice: string = ''
  grxXlmEqui: string = ''
  grxUsdEqui: string = ''
  SecKey: string = ''

  private subs = new SubSink();

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private settingsService: SettingsService,
    private router: Router,
    private stellarService: StellarService,
    private authService: AuthService,
  ) {
    this.federationAddress = this.authService.userData.Federation;
    this.stellarAddress = this.authService.userData.PublicKey;
    this.secretKey = 'GBMF3WYPDWQFOXVL2CO6NQPGQZJWLLKSGVTGGV7QPKCZCIQ3PZJGX4OG';

    // this.subs.add(this.stellarService.observeAccount().subscribe(account => {
    //   console.log('observeAccount:', account)
    //   this.stellarService.getBlFromAcc(account, res => {
    //     this.fillWalletData(res)
    //   })
    // }))

    this.subs.add(this.stellarService.observePrices().subscribe(prices => {
      this.grxP = prices[0]
      this.xlmP = prices[1]      
      this.stellarService.getBlFromAcc(this.stellarService.userAccount, res => {
        this.fillWalletData(res)
      })
    }))
 
  }

  fillWalletData(res){
    this.totalXLM = res.xlm;
    this.totalGRX = res.grx;
    this.xlmBalance =  this.totalXLM*this.xlmP
    this.grxBalance = this.totalGRX*this.grxP*this.xlmP    
    this.walletBalance = this.xlmBalance + this.grxBalance
    this.walletValue = `$ ${this.walletBalance.toFixed(2)}`
    this.GRXValue = '' + Math.round(this.grxBalance*100/this.walletBalance)
    this.XLMValue = '' + (100 - +this.GRXValue)
    this.XLMUsdValue = `$ ${this.xlmBalance.toFixed(2)}`
    this.GRXUsdValue = `$ ${this.grxBalance.toFixed(2)}`
    
    this.authService.userData.totalGRX = this.totalGRX
    this.authService.userData.totalXLM = this.totalXLM
    this.authService.userData.xlmPrice = this.xlmP
    this.authService.userData.grxPrice = this.grxP
    this.authService.SetLocalUserData()     
  }


  ngOnInit() {
    this.observeRevealSecretKey();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  buyGrx(){
    console.log('buy')
    if (!this.authService.hash){
      this.router.navigateByUrl('/login')
    }
    console.log('this.authService.hash:', this.authService.hash)
    this.stellarService.decryptSecretKey(this.authService.hash, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      key => {
        if (key != 'Decryption failed!'){   
          this.SecKey = key          
          console.log('grxPrice:', this.grxPrice)
          console.log('grxAmount:', this.grxAmount)
          let grxOfPrice = +this.grxPrice/this.xlmP
          this.stellarService.buyOrder(this.stellarService.SecretBytesToString(this.SecKey), grxOfPrice.toString(), this.grxAmount).then( res => {
            console.log(res)
            let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
              this.grxP, this.xlmP, this.stellarService.allOffers.length)
              this.stellarService.allOffers.push(of)
            this.snotifyService.simple('Buy order submitted successfully.'); 
          }).catch(e => {
            console.log(e)
          })
        } else {
          console.log('got key')
        }
      })    
  }

  sellGrx(){   
    if (!this.authService.hash){
      this.router.navigateByUrl('/login')
    } else {
      console.log('this.authService.hash:', this.authService.hash)
    }
   
    this.stellarService.decryptSecretKey(this.authService.hash, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      key => {
        if (key != 'Decryption failed!'){   
          this.SecKey = key
          let grxOfPrice = +this.grxPrice/this.xlmP
          this.stellarService.sellOrder(this.stellarService.SecretBytesToString(this.SecKey), grxOfPrice.toString(), this.grxAmount).then( res => {
            console.log(res)
            let of = this.stellarService.parseOffer(res.offerResults[0].currentOffer, 
              this.grxP, this.xlmP, this.stellarService.allOffers.length)
              this.stellarService.allOffers.push(of)
            this.snotifyService.simple('Sell order submitted successfully.'); 
          }).catch(e => {
            console.log(e)
          })
        } else {
          console.log('got key')
        }
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
    .subscribe((confirm) => {
      // Not a secure solution. Please make a request to backend to get the code
      this.isSecretKeyRevealed = confirm;
    }));
  }

  populateMaxXLM() {
    this.XLMValue = this.totalXLM.toString();
  }

  populateMaxGRX() {
    this.GRXValue = this.totalGRX.toString();
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
