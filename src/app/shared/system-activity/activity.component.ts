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
import {AlgoPositionModel} from '../../data/models/algoPositionModel';
import { AlgoService } from 'src/app/system/algo.service';
import { ClosePosition } from 'src/app/system/algo-position.model';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { LoadingService } from '../services/loading.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges {

  @Input() activeTabId: string;
  @Input() showCompletedOrdersLink: boolean;

  openAlgoPositions: AlgoPositionModel[] = [];

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

  // Font Awesome Icons
  faDownload = faArrowAltCircleDown;
  faClose = faTimesCircle;
  faInfo = faInfoCircle;
  faCopy = faCopy;
  faSearch = faSearch;
  faSortByPositionValue = faCaretDown;
  faSortByPositionProfit = faCaretDown;
  faSortByROI = faCaretDown;

  allPositions: ClosePosition[] = []
  openPositions: ClosePosition[] = []
  closePositions: ClosePosition[] = []

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private algoService: AlgoService,
    private authService: AuthService,
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {
    //this.populateOpenAlgoPositionsArray();
   
    this.algoService.algoPositions$.subscribe(positions => {
      //this.positions = positions     
      this.algoService.openPositions = positions.filter(pos => {
        if (pos.status == "OPEN"){
          //pos.current_position_ROI_per = pos['current_position_ROI_%']        
          pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          pos.url = "https://stellar.expert/explorer/public/" + pos.open_stellar_transaction_id.toString()      
          this.algoService.grzMetric.TotalValue += pos.current_position_value_$   
          return pos
        }        
      })
      this.algoService.grzMetric.Positions = this.algoService.openPositions.length

      this.algoService.closePositions = positions.filter(pos => {
        if (pos.status != "OPEN"){
          //pos.close_position_ROI_per = pos['close_position_ROI_%']
          pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          pos.url = "https://stellar.expert/explorer/public/" + pos.close_stellar_transaction_id.toString()
          return pos
        }        
      })
      console.log('this.algoService.closePositions', this.algoService.closePositions)
      this.algoService.allPositions = positions.filter(pos => {
        if (pos.status == "OPEN"){
          //pos.current_position_ROI_per = pos['current_position_ROI_%']        
          pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          pos.url = "https://stellar.expert/explorer/public/" + pos.open_stellar_transaction_id.toString()          
          
        }   
        if (pos.status != "OPEN"){
          //pos.close_position_ROI_per = pos['close_position_ROI_%']
          pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          pos.url = "https://stellar.expert/explorer/public/" + pos.close_stellar_transaction_id.toString()         
        } 
        return pos       
      })
    })
  }

  closePosition(position){
    let grzusd = +this.authService.userData.grzPrice
    let grxusd = +this.authService.userData.grxusdPrice
    if (position.algorithm_type === 'GRZ'){
      let close_position_total1_$ = grzusd*position.open_position_value_GRZ
      let close_position_total_$ = position.open_position_value_$ + (grzusd - position.open_value_GRZ)*position.open_position_value_$/position.open_value_GRZ

      console.log('close value: ', close_position_total_$, close_position_total1_$)
      let close_position_value_$ = close_position_total_$ *(100-0.003)/100
      if  (this.authService.userData.grzPrice - position.open_value_GRZ > 0) {
        close_position_value_$ = close_position_total_$ *(100 - 0.18 - 0.003)/100
      }
      
      this.http.post(environment.grz_api_url + 'api/v1/grz/position/close', {
        user_id: this.authService.userInfo.Uid,            
        open_stellar_transaction_id: position.open_stellar_transaction_id,
        open_position_timestamp: position.open_position_timestamp,
        grayll_transaction_id: position.grayll_transaction_id,        
        algorithm_type: position.algorithm_type,
        
        close_value_GRX:              grxusd,
        close_value_GRZ:              grzusd,

        close_position_value_$:       close_position_value_$,
        close_position_value_GRX:     close_position_value_$/grxusd,
        close_position_ROI_$:         close_position_value_$  - position.open_position_total_$,
        close_position_ROI_percent:   (grzusd - position.open_value_GRZ)*100/position.open_value_GRZ,
        current_position_ROI_$:       close_position_value_$  - position.open_position_total_$,
        current_position_ROI_percent: (grzusd - position.open_value_GRZ)*100/position.open_value_GRZ,
        close_position_total_$:    close_position_total_$,
        close_position_total_GRX:  close_position_total_$/grxusd,
        close_position_total_GRZ:   close_position_total1_$/grzusd,
        close_position_fee_$:      close_position_total_$*0.003,
        close_position_fee_GRX:      close_position_total_$*0.003/grxusd,
        close_performance_fee_$:   grzusd - position.open_value_GRZ > 0? close_position_total_$*0.18: 0,
        close_performance_fee_GRX: grzusd - position.open_value_GRZ > 0? 
                                    close_position_total_$*0.18/grxusd: 0       

      }).subscribe( res => {
        console.log(res)
        //this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
        this.loadingService.hide()
      },
      e => {
       // this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
        this.loadingService.hide()
      })
    } else {
      this.http.post(environment.gry_api_url + 'api/v1/gry/position/close', {
        user_id: this.authService.userInfo.Uid,            
        open_stellar_transaction_id: position.open_stellar_transaction_id,
        grayll_transaction_id: position.grayll_transaction_id,        
        algorithm_type: position.algorithm_type,

        // gry_price_$: this.algoPosition.itemPrice,
        // grx_price_$: this.algoPosition.grxPrice,
        // open_position_total_$:+this.algoPosition.usdValue,
        // open_position_fee_$:+this.algoPosition.usdValue*+this.selectedTab.fee,
        // open_position_fee_GRX:this.algoPosition.grxAmount*+this.selectedTab.fee,

        // open_position_value_$:this.algoPosition.positionValue,
        // open_position_total_GRX:+this.algoPosition.grxAmount,
        // open_position_value_GRZ:+this.algoPosition.itemAmount,
        // open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee),
      }).subscribe( 
        res => {
        //this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
        this.loadingService.hide()
      },
      e => {
       // this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
        this.loadingService.hide()
      })
    }
  }

  ngOnInit() {
    this.setActiveTab();
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
    console.log(this.selectedTab)
  }

  copySuccess(account: string) {
    if (this.clipboardService.copyFromContent(account)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  // Infinite Scroll
  onScroll() {
    //this.populateOpenAlgoPositionsArray();
  }

  getCountdownConfigFor(duration: number): CountdownConfig {
    return {
      leftTime: duration * 13,
      demand: false,
      template: '$!h!:$!m! | $!d!',
      effect: null
    };
  }

  
}
