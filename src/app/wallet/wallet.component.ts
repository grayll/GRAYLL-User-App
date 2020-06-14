import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {SnotifyService} from 'ng-snotify';
//import { SwUpdate, SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy {

  faWarning = faExclamationTriangle;
  shouldReload:boolean 
  pageId: string

  constructor(
    public sharedService: SharedService,
    public stellarService: StellarService,
    public authService: AuthService,
    private snotifyService: SnotifyService    
  ) {
    this.pageId = "wallet"  
    this.shouldReload = false     
    this.authService.subShouldReload().subscribe(s => {    
      // make change on  shouldReload so OnChange on account activity is triggered
      this.shouldReload = !this.shouldReload
    })
   }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.changeBackgroundColor(true);   
  }
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
    // save user data totalxlm,grx,openorders   
    this.authService.updateUserMeta()
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }


}
