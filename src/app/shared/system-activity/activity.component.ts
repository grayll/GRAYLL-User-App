import {Component, Input, OnChanges, OnInit, SimpleChanges, HostListener, OnDestroy} from '@angular/core';
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
import { AlgoService, AlgoMetric, AlgoMetrics } from 'src/app/system/algo.service';
import { ClosePosition } from 'src/app/system/algo-position.model';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { LoadingService } from '../services/loading.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {SubSink} from 'subsink'
import FPC from 'floating-point-calculator';


@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges, OnDestroy {

  @Input() activeTabId: string;
  @Input() showCompletedOrdersLink: boolean;

  subsink: SubSink

  openAlgoPositions: AlgoPositionModel[] = [];

  selectedTab: {id: string, name: string};
  isSortedUpByPositionValue: boolean;
  isSortedUpByPositionProfit: boolean;
  isSortedUpByROI: boolean;

  roi24: number = 0
  roi7d: number = 0
  roi: number = 0

  roi24Cnt: number = 0
  roi7dCnt: number = 0
  
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
    this.subsink = new SubSink()    
    this.algoService.subsAlgoPositions()
    this.subsink.add(this.algoService.algoPositions$.subscribe(positions => {           
      let positionClosed = true
      this.algoService.grzMetric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.algoService.gry1Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.algoService.gry2Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.algoService.gry3Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.algoService.gryMetric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}

      this.algoService.openPositions = positions.filter(pos => {
        if (pos.status == "OPEN"){               
          pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          if (pos.open_stellar_transaction_id) {
            pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.open_stellar_transaction_id  
          } else {
            pos.url = ""
          }   
          if (this.algoService.closeGrayllId === pos.grayll_transaction_id){
            positionClosed = false
          }

          switch (pos.algorithm_type){
            case "GRZ":             
              this.calculateMetrics(pos, this.algoService.grzMetric)
              break
            case "GRY 1":
              this.calculateMetrics(pos, this.algoService.gry1Metric)     
              // Calculate total gry metric
              this.calculateMetrics(pos, this.algoService.gryMetric)
              break
            case "GRY 2":
              this.calculateMetrics(pos, this.algoService.gry2Metric)
              // Calculate total gry metric
              this.calculateMetrics(pos, this.algoService.gryMetric)          
              break
            case "GRY 3":
              this.calculateMetrics(pos, this.algoService.gry3Metric)
              // Calculate total gry metric
              this.calculateMetrics(pos, this.algoService.gryMetric)          
              break
          }          
          return pos
        }        
      })

      if (this.algoService.closeGrayllId && positionClosed === true){
        this.loadingService.hide()
        this.algoService.closeGrayllId = ''
      }

      if (this.algoService.closeAll && this.algoService.openPositions.length == 0){
        this.loadingService.hide()
        this.algoService.closeAll = false
        this.authService.pushCloseAllEnd(true)
      }
     
      this.updateAverageMetric(this.algoService.grzMetric, "grz")
      this.updateAverageMetric(this.algoService.gry1Metric, "gry1")      
      this.updateAverageMetric(this.algoService.gry2Metric, "gry2")
      this.updateAverageMetric(this.algoService.gry3Metric, "gry3")
      
      // console.log('this.algoService.openPositions', this.algoService.openPositions)
      // console.log('this.algoService.grzMetric', this.algoService.grzMetric)

      this.algoService.closePositions = positions.filter(pos => {
        if (pos.status != "OPEN"){          
          pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          if (pos.close_stellar_transaction_id) {
            pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.close_stellar_transaction_id.toString()   
          } else {
            pos.url = ""
          } 
          return pos
        }        
      })
      //console.log('this.algoService.closePositions', this.algoService.closePositions)
      this.algoService.allPositions = positions.filter(pos => {
        if (pos.status == "OPEN"){
          //pos.current_position_ROI_per = pos['current_position_ROI_%']        
          pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          if (pos.open_stellar_transaction_id) {
            pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.open_stellar_transaction_id.toString()   
          } else {
            pos.url = ""
          }          
        }   
        if (pos.status != "OPEN"){
          //pos.close_position_ROI_per = pos['close_position_ROI_%']
          pos.time = moment.utc(pos.close_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
          if (pos.close_stellar_transaction_id) {
            pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.close_stellar_transaction_id.toString()   
          } else {
            pos.url = ""
          }        
        } 
        return pos       
      })
    }))
  }

  calculateMetrics(pos: ClosePosition, metric : AlgoMetrics){  
    //console.log('CALCULATE-pos.current_position_ROI_$:', pos.current_position_ROI_$) 
    metric.CurrentProfit = FPC.add(metric.CurrentProfit, pos.current_position_ROI_$) 
    metric.TotalValue = FPC.add(metric.TotalValue, pos.current_position_value_$)
    metric.Positions +=1
             
    if (pos.duration <= 1440*60){
      metric.OneDayPercent = FPC.add(metric.OneDayPercent, pos.current_position_ROI_percent)
      metric.OneDayCnt++
    }
    if (pos.duration <= 10080*60){
      metric.SevenDayPercent = FPC.add(metric.SevenDayPercent, pos.current_position_ROI_percent)
      metric.SevenDayCnt++
    }
    metric.ROIPercent = FPC.add(metric.ROIPercent, pos.current_position_ROI_percent)
    
  }

  updateAverageMetric(metric : AlgoMetrics, type: string){
    //console.log('CALCULATE-metric.CurrentProfit-positions:', metric.CurrentProfit, metric.Positions) 
    if (metric.OneDayCnt > 0){
      metric.OneDayPercent = metric.OneDayPercent/metric.OneDayCnt
    }
    if (metric.SevenDayCnt > 0){
      metric.SevenDayPercent = metric.SevenDayPercent/metric.SevenDayCnt
    }
    if (metric.Positions > 0){
      metric.ROIPercent = metric.ROIPercent/metric.Positions
    }

    switch(type){
      case "grz":
        this.authService.userMetaStore.total_grz_open_positions = this.algoService.grzMetric.Positions
        this.authService.userMetaStore.total_grz_current_position_ROI_$ = this.algoService.grzMetric.CurrentProfit
        this.authService.userMetaStore.total_grz_current_position_value_$ = this.algoService.grzMetric.TotalValue      
        break
      case "gry1":
        this.authService.userMetaStore.total_gry1_open_positions = this.algoService.gry1Metric.Positions
        this.authService.userMetaStore.total_gry1_current_position_ROI_$ = this.algoService.gry1Metric.CurrentProfit
        this.authService.userMetaStore.total_gry1_current_position_value_$ = this.algoService.gry1Metric.TotalValue
      case "gry2":
        this.authService.userMetaStore.total_gry2_open_positions = this.algoService.gry2Metric.Positions
        this.authService.userMetaStore.total_gry2_current_position_ROI_$ = this.algoService.gry2Metric.CurrentProfit
        this.authService.userMetaStore.total_gry2_current_position_value_$ = this.algoService.gry2Metric.TotalValue
        break
      case "gry3":
        this.authService.userMetaStore.total_gry3_open_positions = this.algoService.gry3Metric.Positions
        this.authService.userMetaStore.total_gry3_current_position_ROI_$ = this.algoService.gry3Metric.CurrentProfit
        this.authService.userMetaStore.total_gry3_current_position_value_$ = this.algoService.gry3Metric.TotalValue
        break  
    }
  }
  
  closePosition(position){
    this.loadingService.show()
    let grzusd = this.authService.priceInfo.grzusd
    let grxusd = this.authService.priceInfo.grxusd
    this.algoService.closeGrayllId = position.grayll_transaction_id
    if (position.algorithm_type === 'GRZ'){
            
      //let close_position_total_$1 = position.open_position_value_$ * (((grzusd - position.open_value_GRZ)/position.open_value_GRZ) + 1)
      let close_position_total_$ = position.open_position_value_$ * ((((grzusd - position.open_value_GRZ)/position.open_value_GRZ) / 1.00) + 1)
      
      let close_position_fee_$ = close_position_total_$*0.003
      let close_position_ROI_$ = close_position_total_$ - position.open_position_value_$       

      let close_performance_fee_$ = 0
      let netRoi = close_position_ROI_$ - close_position_fee_$
      if (netRoi > 0) {
        close_performance_fee_$ =  netRoi * 0.18
      }

      let close_position_total_GRX = close_position_total_$/grxusd
      let close_position_value_$ = close_position_total_$ - close_position_fee_$ - close_performance_fee_$
      let close_position_ROI_percent = (grzusd - position.open_value_GRZ)*100/position.open_value_GRZ
      //let close_position_ROI_percent_GROSS = (close_position_ROI_$ * 100)/position.open_position_value_$
      let close_position_ROI_percent_NET = ((close_position_value_$-position.open_position_value_$)*100)/position.open_position_value_$  
      
      console.log('close_position_ROI_$', close_position_ROI_$)
      console.log("close_position_value_GRX:", close_position_value_$/grxusd)
      console.log('close_position_total_$', close_position_total_$)
      console.log('close_position_ROI_percent', close_position_ROI_percent)
      
      this.http.post(environment.grz_api_url + 'api/v1/grz/position/close',
        {user_id: this.authService.userInfo.Uid,            
        open_stellar_transaction_id: position.open_stellar_transaction_id,
        open_position_timestamp: position.open_position_timestamp,
        grayll_transaction_id: position.grayll_transaction_id,        
        algorithm_type: position.algorithm_type,
        
        close_value_GRX:              grxusd,
        close_value_GRZ:              grzusd,

        close_position_value_$:       close_position_value_$,
        close_position_value_GRX:     close_position_value_$/grxusd,
        close_position_ROI_$:         close_position_ROI_$,
        close_position_ROI_percent:   close_position_ROI_percent,
        close_position_ROI_percent_NET:   close_position_ROI_percent_NET,
        current_position_ROI_$:       close_position_ROI_$,
        current_position_ROI_percent: close_position_ROI_percent,
        close_position_total_$:    close_position_total_$,
        close_position_total_GRX:  close_position_total_GRX,
        close_position_total_GRZ:   close_position_total_$/grzusd,
        close_position_fee_$:      close_position_fee_$,
        close_position_fee_GRX:      close_position_fee_$/grxusd,
        close_performance_fee_$:   close_performance_fee_$,
        close_performance_fee_GRX: close_performance_fee_$/grxusd     

      }).subscribe( res => {
        console.log(res)             
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
        setTimeout(() => {
          this.loadingService.hide()
        }, 1500);   
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

  
  @HostListener('window:beforeunload')
  ngOnDestroy():void {
    // update user meta store related to grz gry metric
    this.authService.saveUserMetaStore()
    this.subsink.unsubscribe()    
  }  
}
