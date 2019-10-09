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

  private subscriptions = new SubSink();

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

    this.stellarService.getAccountBalance(this.authService.userData.PublicKey, res => {
      this.totalXLM = res.xlm;
      this.totalGRX = res.grx;
      console.log('getCurrentGrxPrice xlm: ', res)
      this.stellarService.getCurrentGrxPrice(resp =>{
        if (resp.err) {
          console.log('getCurrentGrxPrice error: ', resp.err)
          this.XLMValue = '';
          this.GRXValue = '';
          this.snotifyService.simple('Please check your internet connection');
        } else {
          this.stellarService.getCurrentXlmPrice(resp1 => {
            if (resp1.err){
              this.XLMValue = '';
              this.GRXValue = '';
              this.snotifyService.simple('Please check your internet connection');
            } else {        
              this.xlmBalance =  this.totalXLM*resp1.p
              this.grxBalance = this.totalGRX*resp.p    
              this.walletBalance = this.xlmBalance + this.grxBalance
              this.walletValue = `$ ${this.walletBalance.toFixed(2)}`
              this.GRXValue = '' + Math.round(this.totalGRX*resp.p*100/this.walletBalance)
              this.XLMValue = '' + (100 - +this.GRXValue)
              this.XLMUsdValue = `$ ${this.xlmBalance.toFixed(2)}`
              this.GRXUsdValue = `$ ${this.grxBalance.toFixed(2)}`

              this.authService.userData.totalGRX = this.totalGRX
              this.authService.userData.totalXLM = this.totalXLM
              this.authService.userData.xlmPrice = resp1.p
              this.authService.userData.grxPrice = resp.p
              this.authService.SetLocalUserData()
            }
          })
        }
      })     
    })
  }

  ngOnInit() {
    this.observeRevealSecretKey();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    this.subscriptions.sink = this.settingsService.observeConfirmAuthority()
    .subscribe((confirm) => {
      // Not a secure solution. Please make a request to backend to get the code
      this.isSecretKeyRevealed = confirm;
    });
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
