import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {SnotifyService} from 'ng-snotify';
// import { Renderer2, Inject } from '@angular/core';
// import { DOCUMENT } from '@angular/common';

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
    private snotifyService: SnotifyService,
    // private _renderer2: Renderer2, 
    //     @Inject(DOCUMENT) private _document: Document   
  ) {
    this.pageId = "wallet"  
    this.shouldReload = false     
    this.authService.subShouldReload().subscribe(s => {    
      // make change on  shouldReload so OnChange on account activity is triggered
      this.shouldReload = !this.shouldReload
    })
   }

  ngOnInit(): void {
    // let script = this._renderer2.createElement('script');
    // script.type = `application/ld+json`;
    // script.text = `
    //     {
    //       <script>
    //         gtag('event', 'conversion', {'send_to': 'AW-935299715/DCBoCLqAxt8BEIOV_r0D'});
    //       </script>    
    //     }
    // `;

    // this._renderer2.appendChild(this._document.body, script);
    window.scroll(0, 0);
    this.changeBackgroundColor(true);   

    // check whether user export their wallet
    // console.log(this.authService.userData.Federation)
    // this.stellarService.getAccountFromFed(this.authService.userData.Federation).then(fed => {
    //   console.log('Fed add:', fed)
    // }).catch(e => {
    //   console.log('Fed add e:', e)
    // })
  }
 // @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
    // save user data totalxlm,grx,openorders   
    // console.log('Update META')
    // this.authService.updateUserMeta()
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }


}
