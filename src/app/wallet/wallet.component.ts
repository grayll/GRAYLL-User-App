import {Component, OnDestroy, OnInit} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {SnotifyService} from 'ng-snotify';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy {

  faWarning = faExclamationTriangle;

  constructor(
    public sharedService: SharedService,
    public stellarService: StellarService,
    public authService: AuthService,
    private snotifyService: SnotifyService,
  ) {
   
    Promise.all([
      this.stellarService.getCurrentGrxPrice1(),
      this.stellarService.getCurrentXlmPrice1(),
      this.stellarService.getAccountData(this.authService.userData.PublicKey)
      .catch(err => {
        // Notify internet connection.
        this.snotifyService.simple('Please check your internet connection.')
        console.log(err)
      })
    ])
    .then(([ grx, xlm, account ]) => {
      console.log(grx, xlm)
      console.log('wallet.com acc: ', account)
      this.stellarService.userAccount = account;
      this.stellarService.publishPrices([+grx,+xlm])
      //this.stellarService.publishAccount(account)
      
      //console.log('wallet.com this.stellarService.userAccount :', this.stellarService.userAccount)
    })
   }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.changeBackgroundColor(true);
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }


}
