import {Component, OnDestroy, OnInit} from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';
import {ActivatedRoute} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, OnDestroy {

  selectedTab: {id: string, name: string};
  activityTabs = [
    {
      id: 'system-activity',
      name: 'GRAYLL System Activity'
    },
    {
      id: 'wallet-activity',
      name: 'GRAYLL Wallet Activity'
    }
  ];
  // Font Awesome Icons
  faWarning = faExclamationTriangle;
  activeTabId: string;
  activeSubTabId: string;
  pageId: string

  constructor(
    public sharedService: SharedService,
    private activatedRoute: ActivatedRoute,    
    public stellarService: StellarService,
    public authService: AuthService,
    private snotifyService: SnotifyService,
  ) {
    this.pageId = "data"
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
      console.log(account)      
      this.stellarService.userAccount = account;
      this.stellarService.publishPrices([+grx,+xlm])     
    })
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.loadDataFromRoute();
    // this.activeTabId = 'system-activity';
    // this.activeSubTabId = 'closedAlgoPositions';
    this.changeBackgroundColor(true);    
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
  }

  onTabChange(id: string) {
    console.log('tab: ', id)
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
    this.activeTabId = id
    switch (id){
      case 'system-activity':   
      console.log('system')     
        break;
      case 'wallet-activity':
          console.log('wallet')     
        break;
    }
  }

  private loadDataFromRoute() {
    const data = this.activatedRoute.snapshot.data;
    this.activeTabId = 'wallet-activity';
    this.activeSubTabId = data.subTab;
    console.log('TAB:', data.tab)
    console.log('SUB-TAB:', data.subTab)
    if (data.tab) {
      switch (data.tab) {
        case 'system-activity':
          this.activeTabId = 'system-activity';
          this.activeSubTabId = 'closedAlgoPositions';
          break;
        default:
          if (data.subTab) {
            this.activeTabId = 'wallet-activity';
            this.activeSubTabId = data.subTab;
            break;
          }
      }
      this.activeTabId = data.tab;
      setTimeout(() => {
        const el = document.getElementById('tabs');
        el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
      }, 500);
    }
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }

}
