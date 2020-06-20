import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  faArrowAltCircleDown,
  faCaretDown, faCaretUp,
  faCopy,
  faInfoCircle,
  faSearch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { ClipboardService } from 'ngx-clipboard';
import { SnotifyService } from 'ng-snotify';
import { CountdownConfig } from 'ngx-countdown/src/countdown.config';
import { AllTransactionsModel } from '../../data/models/allTransactionsModel';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { PdfDownloadService } from 'src/app/_services/pdf-download.service';
import { AlgoPositionService } from '../../shared/algo-position.service';
import { ReferralService } from 'src/app/referral/referral.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ErrorService } from '../error/error.service';

@Component({
  selector: 'app-referral-activity',
  templateUrl: './referral-activity.component.html',
  styleUrls: ['./referral-activity.component.scss']
})
export class ReferralActivityComponent implements OnInit, OnChanges {

  @Input() activeTabId: string;
  @Input() showCompletedOrdersLink: boolean;

  openAlgoPositions: AllTransactionsModel[] = [];
  closeAlgoPositions: AllTransactionsModel[] = [];
  algoPositions$: Subscription;

  selectedTab: { id: string, name: string };
  isSortedUpByTotalFeesUSD: boolean;
  isSortedUpByTotalFeesGRX: boolean;
  isSortedUpByTotalPayments: boolean;
  isSortedUpByLastReminder: boolean;
  activityTabs = [
    {
      id: 'allTransactions',
      name: 'All Transactions'
    },
    {
      id: 'referralContacts',
      name: 'Referral Contacts'
    },
    {
      id: 'pendingInvites',
      name: 'Pending Invites'
    }
  ];

  // Font Awesome Icons
  faDownload = faArrowAltCircleDown;
  faClose = faTimesCircle;
  faInfo = faInfoCircle;
  faCopy = faCopy;
  faSearch = faSearch;
  faSortByTotalFeesUSD = faCaretDown;
  faSortByTotalFeesGRX = faCaretDown;
  faSortByTotalPayments = faCaretDown;
  faSortByLastReminder = faCaretDown;

  searchControl: FormControl;
  searchControl2: FormControl;
  private debounce: number = 400;
  searchResult: {
    openAlgoPositions: AllTransactionsModel[]
    closeAlgoPositions: AllTransactionsModel[]
  } = {
      openAlgoPositions: [],
      closeAlgoPositions: [],
    };

  columnNamesForPDF = [
    'Open Date',
    'Status',
    'Duration',
    'Algorithm',
    'Price (GRX)',
    'Price (USD)',
    'Position Value (USD)',
    'Position Profit (USD)',
    'ROI',
    'GRAYLL Transaction ID',
    'Stellar Transaction ID',
    'Info'
  ]

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private algoPositionService: AlgoPositionService,
    private pdfService: PdfDownloadService,
    public referralService: ReferralService,
    public authService: AuthService,
    private http: HttpClient,
    private errorService: ErrorService,

  ) {
    this.populateOpenAlgoPositionsArray();
  }

  ngOnInit() {
    this.setActiveTab();

    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        if (query) {
          this.search(query, 'OPEN');
        }
      });
    this.searchControl2 = new FormControl('');
    this.searchControl2.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        if (query) {
          this.search(query, 'CLOSED');
        }
      });
  }

  sendRemind(id){
    this.http.post(`api/v1/users/reinvite/`+id, {})             
    .subscribe(res => { 
      //this.loadingService.hide() 
      console.log(res)
      if ((res as any).errCode == environment.EMAIL_IN_USED)  {
        let content = "The email entered is already registered."
        //this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else if ((res as any).errCode == environment.EMAIL_INVALID){
        let content = "The email entered is invalid."
        //this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else {              
        //this.success = true
        this.errorService.handleError(null, `The reminder already sent.!`)  
      }
    },
    error => {
      //this.loadingService.hide()
      // console.log(error) 
      // this.registerForm.reset()              
      this.errorService.handleError(null, `Currently, Reminder can't be processed. Please try again later!`)     
    })
  }
  removeInvite(id){
    this.http.post(`api/v1/users/delinvite/`+id, {})             
    .subscribe(res => { 
      //this.loadingService.hide() 
      console.log(res)
      if ((res as any).errCode == environment.EMAIL_IN_USED)  {
        let content = "The email entered is already registered."
        //this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else if ((res as any).errCode == environment.EMAIL_INVALID){
        let content = "The email entered is invalid."
        //this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else {              
        //this.success = true
        this.errorService.handleError(null, `The reminder already sent.!`)  
      }
    },
    error => {
      //this.loadingService.hide()
      // console.log(error) 
      // this.registerForm.reset()              
      this.errorService.handleError(null, `Currently, Reminder can't be processed. Please try again later!`)     
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeTabId && changes.activeTabId.currentValue) {
      this.selectedTab = this.activityTabs.find((t) => t.id === changes.activeTabId.currentValue);
    }
  }

  private setActiveTab() {
    if (this.activeTabId && this.activeTabId !== 'allOrders' && this.activeTabId !== 'transfers' && this.activeTabId !== 'networkHistory') {
      this.selectedTab = this.activityTabs.find((t) => t.id === this.activeTabId);
    } else {
      this.selectedTab = this.activityTabs[0];
    }
  }

  sortByTotalFeesUSD() {
    if (this.isSortedUpByTotalFeesUSD) {
      this.faSortByTotalFeesUSD = faCaretDown;
      this.isSortedUpByTotalFeesUSD = false;
    } else {
      this.faSortByTotalFeesUSD = faCaretUp;
      this.isSortedUpByTotalFeesUSD = true;
    }
  }

  sortByTotalFeesGRX() {
    if (this.isSortedUpByTotalFeesGRX) {
      this.faSortByTotalFeesGRX = faCaretDown;
      this.isSortedUpByTotalFeesGRX = false;
    } else {
      this.faSortByTotalFeesGRX = faCaretUp;
      this.isSortedUpByTotalFeesGRX = true;
    }
  }

  sortByTotalPayments() {
    if (this.isSortedUpByTotalPayments) {
      this.faSortByTotalPayments = faCaretDown;
      this.isSortedUpByTotalPayments = false;
    } else {
      this.faSortByTotalPayments = faCaretUp;
      this.isSortedUpByTotalPayments = true;
    }
  }

  sortByLastReminder() {
    if (this.isSortedUpByLastReminder) {
      this.faSortByLastReminder = faCaretDown;
      this.isSortedUpByLastReminder = false;
    } else {
      this.faSortByLastReminder = faCaretUp;
      this.isSortedUpByLastReminder = true;
    }
  }

  onTabChange(id: string) {
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
    this.searchControl.patchValue('');
  }

  copySuccess(account: string) {
    if (this.clipboardService.copyFromContent(account)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  // Infinite Scroll
  onScroll() {
    this.populateOpenAlgoPositionsArray();
  }

  getCountdownConfigFor(duration: number): CountdownConfig {
    return {
      leftTime: duration * 13,
      demand: false,
      template: '$!h!:$!m! | $!d!',
      effect: null
    };
  }

  private populateOpenAlgoPositionsArray() {
    const mockup = new AllTransactionsModel(
      1,
      '18/08/2019 04:14',
      'Aaaabbbbccccddddeeee',
      'Aaaabbbbccccddddeeee',
      'Aaaabbbbccccddddeeee',
      'Aaaabbbccccddddeeee@Aaaabbbccc.com',
      '+ 888 888 888 8888',
      '999,999,999.9999',
      '999,999,999.9999',
      8888,
      '18/08/2019 04:14',
      '0108181408618385411',
    );
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
    this.openAlgoPositions.push(mockup);
  }

  DownloadPdf() {
    let data = [...this.getCurrentTabData()];
    this.pdfService.savePDF(this.columnNamesForPDF, Object.keys(data[0]), data, 'pdf_print_' + Date.now());
    console.log('ok');
  }

  getCurrentTabData() {
    if (this.selectedTab.id === 'closedAlgoPositions') {
      return this.closeAlgoPositions.map(el => {
        let mock = { ...el, info: 'https://stellar.expert/explorer/public' };
        delete mock.id;
        return mock;
      });
    }
    else if (this.selectedTab.id === 'openAlgoPositions') {
      return this.openAlgoPositions.map(el => {
        let mock = { ...el, info: 'https://stellar.expert/explorer/public' };
        delete mock.id;
        return mock;
      });
    }
    else {
      return [...this.openAlgoPositions, ...this.closeAlgoPositions].map(el => {
        let mock = { ...el, info: 'https://stellar.expert/explorer/public' };
        delete mock.id;
        return mock;
      });
    }
  }

  search(key, status) {
    console.log(key);
    this.algoPositionService.search({ query: key, filters: 'status:' + status }).then(result => {
      // console.log(result.hits);
      result.hits = result.hits.filter(el => {
        let isFind = false;
        Object.values(el._highlightResult).some(highlight => {
          if (highlight['matchLevel'] === 'full') isFind = true;
          return isFind;
        });
        return isFind;
      })
      if (status === 'OPEN') {
        this.searchResult.openAlgoPositions = result.hits;
      }
      else {
        this.searchResult.closeAlgoPositions = result.hits;
      }
    }, err => {
      this.searchResult.openAlgoPositions = [];
      this.searchResult.closeAlgoPositions = [];
      console.log(err);
    })
  }

  ngOnDestroy() {
    if (this.algoPositions$) {
      this.algoPositions$.unsubscribe();
    }
  }
}

