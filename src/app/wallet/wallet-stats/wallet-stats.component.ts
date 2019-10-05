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
  walletValue: string;
  walletBalance: number;
  XLMValue: string;
  GRXValue: string;
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
              this.walletBalance = this.totalGRX*resp.p + this.totalXLM*resp1.p
              this.walletValue = `$ ${this.walletBalance.toFixed(2)}`
              this.GRXValue = '' + Math.round(this.totalGRX*resp.p*100/this.walletBalance)
              this.XLMValue = '' + Math.round(this.totalXLM*resp1.p*100/this.walletBalance)
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
