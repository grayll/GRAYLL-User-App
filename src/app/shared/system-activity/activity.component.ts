import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {
  faArrowAltCircleDown,
  faCaretDown, faCaretUp,
  faCopy,
  faInfoCircle,
  faSearch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {CountdownConfig} from 'ngx-countdown/src/countdown.config';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges {

  @Input() activeTabId: string;

  selectedTab: {id: string, name: string};
  isSortedUpByPositionValue: boolean;
  isSortedUpByPositionProfit: boolean;
  isSortedUpByROI: boolean;
  activityTabs = [
    {
      id: 'openAlgoPositions',
      name: 'Open Algo Positions'
    },
    {
      id: 'closedAlgoPositions',
      name: 'Closed Algo Positions'
    },
    {
      id: 'allAlgoPositions',
      name: 'All Algo Positions'
    }
  ];
  countdownConfig: CountdownConfig = {
    leftTime: 86400 * 13,
    demand: false,
    template: '$!h!:$!m! | $!d!',
    effect: null
  };

  // Font Awesome Icons
  faDownload = faArrowAltCircleDown;
  faClose = faTimesCircle;
  faInfo = faInfoCircle;
  faCopy = faCopy;
  faSearch = faSearch;
  faSortByPositionValue = faCaretDown;
  faSortByPositionProfit = faCaretDown;
  faSortByROI = faCaretDown;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService
  ) {
    this.setActiveTab();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeTabId && changes.activeTabId.currentValue) {
      this.selectedTab = this.activityTabs.find((t) => t.id === changes.activeTabId.currentValue);
    }
  }

  private setActiveTab() {
    this.selectedTab = this.activityTabs[0];
  }

  sortByPositionValue() {
    if (this.isSortedUpByPositionValue) {
      this.faSortByPositionValue = faCaretDown;
      this.isSortedUpByPositionValue = false;
    } else {
      this.faSortByPositionValue = faCaretUp;
      this.isSortedUpByPositionValue = true;
    }
  }

  sortByPositionProfit() {
    if (this.isSortedUpByPositionProfit) {
      this.faSortByPositionProfit = faCaretDown;
      this.isSortedUpByPositionProfit = false;
    } else {
      this.faSortByPositionProfit = faCaretUp;
      this.isSortedUpByPositionProfit = true;
    }
  }

  sortByROI() {
    if (this.isSortedUpByROI) {
      this.faSortByROI = faCaretDown;
      this.isSortedUpByROI = false;
    } else {
      this.faSortByROI = faCaretUp;
      this.isSortedUpByROI = true;
    }
  }

  onTabChange(id: string) {
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
  }

  copySuccess(account: string) {
    if (this.clipboardService.copyFromContent(account)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

}
