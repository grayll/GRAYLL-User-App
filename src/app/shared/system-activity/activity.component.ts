import {Component, Input, OnChanges, OnInit, SimpleChanges, HostListener, OnDestroy} from '@angular/core';

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
import { SharedService } from '../shared.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {faArrowAltCircleDown, faCopy, faInfoCircle, faSearch, faTimesCircle, faCaretDown, faCaretUp} from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { AccountActivityService } from '../account-activity/account-activity.service';
import { AdminService } from 'src/app/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges, OnDestroy {

  @Input() activeTabId: string;
  @Input() showCompletedOrdersLink: boolean;
  @Input() userAccount: string;
	@Input() hideRouterOutlet: boolean;

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

//dropdown items
  dropdownItems = [
    "Close All Algo Positions GRZ",
    "Close All Algo Positions GRY 1",
    "Close All Algo Positions GRY 2",
    "Close All Algo Positions GRY 3"
  ];

  //variable to be sent to the modal
  algoName: any = 'Close All Algo Positions GRZ';
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

  private debounce: number = 400;
  isInitData: boolean = true  

  searchControl: FormControl;
  searchResult: any[];

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private algoService: AlgoService,
    private authService: AuthService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private sharedService:SharedService,
    private accountService: AccountActivityService,
    private adminService: AdminService,
    private router: Router,
  ) {
    this.subsink = new SubSink()   
  }

  ngOnInit() {
    this.setActiveTab();
    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        if (query) {  
                  
          this.accountService.searchData('algoPosition', this.authService.userInfo.Uid, query).then(data => {            
            this.searchResult = data.hits          
            if (this.selectedTab.id === 'closedAlgoPositions'){
              
              this.algoService.closePositions = this.searchResult.filter(pos => {
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
              //console.log(this.algoService.closePositions)
            } else if (this.selectedTab.id === 'allAlgoPositions'){
              
              //console.log('this.algoService.closePositions', this.algoService.closePositions)
              this.algoService.allPositions = this.searchResult.filter(pos => {
                pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
                if (pos.status == "OPEN"){
                  //pos.current_position_ROI_per = pos['current_position_ROI_%']        
                  //pos.time = moment.utc(pos.open_position_timestamp*1000).local().format('DD/MM/YYYY HH:mm')
                  if (pos.open_stellar_transaction_id) {
                    pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.open_stellar_transaction_id.toString()   
                  } else {
                    pos.url = ""
                  }          
                }   
                if (pos.status != "OPEN"){
                  //pos.close_position_ROI_per = pos['close_position_ROI_%']
                  
                  if (pos.close_stellar_transaction_id) {
                    pos.url = "https://stellar.expert/explorer/public/search?term=" + pos.close_stellar_transaction_id.toString()   
                  } else {
                    pos.url = ""
                  }        
                } 
                return pos       
              })
              //console.log(this.algoService.allPositions)
            }            
          }).catch(e => {
            console.log(e)
          })
        }
      }); 
  }

  closeAll(){
  
    let positions = []
    let index = this.algoName.indexOf("GR");
    let algoName = this.algoName.substring(index, this.algoName.length);
    this.algoService.openPositions.forEach( position => {
      if (position.algorithm_type == algoName){
        let data = {
          grayllTxId:position.grayll_transaction_id,
          algorithm:position.algorithm_type,
          grxUsd:this.authService.priceInfo.grxusd,
          positionValue:position.current_position_value_$,
          positionValueGRX:position.current_position_value_GRX,       
        }  
        positions.push(data)
      }
    })

    if (positions.length > 0) {
      let data = {
        positions:positions,
        userId:this.authService.userInfo.Uid,
        name:this.authService.userData.Name,
        lname:this.authService.userData.LName,
        publicKey:this.authService.userInfo.PublicKey,
        pauseUntil:this.adminService.adminSetting.pauseUntil,
        clientTime:Math.ceil(moment().valueOf()/1000),
      }
      this.algoService.closeAllPositions = data
    }
        
    if (this.adminService.showClose(algoName)){
      return
    } 
    if (!this.algoService.closeAllPositions){
      return
    }
    if (this.checkVolatile(this.algoService.closeAllPositions)){
      return
    }   
    this.router.navigate(['/system/overview', {outlets: {popup: 'cancel-algo-positions/'+algoName}}]);
  }

  checkVolatile(positions){
    // check whether closing is pause due to GRX volatile 
    //let index = this.algoName.indexOf("GR");
    //let algoName = this.algoName.substring(index, this.algoName.length);
    let mins = Math.round((this.adminService.adminSetting.pauseUntil - moment().valueOf()/1000)/60)
    let ret = false
    if (this.adminService.adminSetting.pauseClosing){
      this.snotifyService.warning(`Due to excessive GRX market volatility — closing algo positions has been temporarily paused. Please retry later.`, {
				timeout: -1,
				showProgressBar: false,
				closeOnClick: false,
				pauseOnHover: true
      });      
      ret = true
    } else if (mins > 0){
      this.snotifyService.warning(`Due to excessive GRX market volatility — closing algo positions has been temporarily paused. Please retry in ${mins} minutes.`, {
				timeout: -1,
				showProgressBar: false,
				closeOnClick: false,
				pauseOnHover: true
      });
      ret = true
    }
    
    if (ret){ 
      this.http.post(environment.api_url + `api/v1/users/reportclosing`, positions).subscribe(res => {
        //console.log(res)
      })
    }
    return ret
  }
  
  closePosition(position){
    if (this.adminService.showClose(position.algorithm_type)){
      return
    } 
    let positions = [] 
    let data = {
      grayllTxId:position.grayll_transaction_id,
      algorithm:position.algorithm_type,
      grxUsd:this.authService.priceInfo.grxusd,
      positionValue:position.current_position_value_$,
      positionValueGRX:position.current_position_value_GRX,      
    }   
   
    positions.push(data)

    let closeData = {
      positions:positions,
      userId:this.authService.userInfo.Uid,
      name:this.authService.userData.Name,
      lname:this.authService.userData.LName,
      publicKey:this.authService.userInfo.PublicKey,
      pauseUntil:this.adminService.adminSetting.pauseUntil,
      clientTime:Math.ceil(moment().valueOf()/1000),
    } 
    if (this.checkVolatile(closeData)){
      return
    }
    
    this.loadingService.show()

    
    
   // let grxusd = this.authService.priceInfo.grxusd
    this.algoService.closeGrayllId = position.grayll_transaction_id
    // if (position.algorithm_type === 'GRZ'){
      
    //   this.http.post(environment.grz_api_url + 'api/v1/grz/position/close', closeData).subscribe( res => {
    //     if ((res as any).errCode != environment.SUCCESS){
    //       this.loadingService.hide()
    //     }            
    //   },
    //   e => {
    //    // this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
    //     this.loadingService.hide()
    //   })
    // } else {
    //   //let gryusd = this.authService.priceInfo.gryusd
    //   let url = ''
    //   switch(position.algorithm_type){
    //     case "GRY 1":
    //       url = environment.gry1_api_url 
    //       break
    //     case "GRY 2":
    //       url = environment.gry2_api_url 
    //       break
    //     case "GRY 3":
    //       url = environment.gry3_api_url 
    //       break
    //   }
           
    //   // let data = {user_id: this.authService.userInfo.Uid,       
    //   //   grayll_transaction_id: position.grayll_transaction_id, 
    //   //   grxusd:this.authService.priceInfo.grxusd,
    //   // }
    //   this.http.post(url + 'api/v1/gry/position/close', closeData).subscribe( res => {
    //     if ((res as any).errCode != environment.SUCCESS){
    //       this.loadingService.hide()
    //     }              
    //   },
    //   e => {       
    //     this.loadingService.hide()
    //   })     
    // }

    let url = ''
    switch(position.algorithm_type){
      case "GRY 1":
        url = environment.gry1_api_url + 'api/v1/gry/position/close'
        break
      case "GRY 2":
        url = environment.gry2_api_url + 'api/v1/gry/position/close'
        break
      case "GRY 3":
        url = environment.gry3_api_url + 'api/v1/gry/position/close'
        break
      case 'GRZ':
        url = environment.grz_api_url + 'api/v1/grz/position/close'
        break
    }
    
    this.http.post(url, closeData).subscribe( res => {
      if ((res as any).errCode != environment.SUCCESS){
        this.loadingService.hide()
      }              
    },
    e => {       
      this.loadingService.hide()
    }) 
  }

  downloadHistory(){
    //console.log('this.selectedTab.id:', this.selectedTab.id)    
    switch(this.selectedTab.id){
      case 'openAlgoPositions':
        this.download('openAlgoPositions')
        break
      case 'closedAlgoPositions':
        this.download('closedAlgoPositions')
        break
      case 'allAlgoPositions':
        this.download('allAlgoPositions')
        break
    }
  }
  download(table:string){
    var fields = []
    var columns = []
    var fileName = ''
    var data:any
    switch (table){
      case "openAlgoPositions":
        columns = ['Open Date',	'Status',	'Duration',	'Algorithm',	'Price (GRX)',	'Price (USD)',	'Position Value',	'Position Profit','ROI', 'GRAYLL Transaction ID','Stellar Transaction ID', 'Info']
        fields = ['time','status','duration_string','algorithm_type', 'open_value_GRX','open_value_GRZ','current_position_value_$','current_position_ROI_$', 'current_position_ROI_percent', 'grayll_transaction_id', 'open_stellar_transaction_id', 'url']
        fileName = "OpenAlgoPositions.PDF"        
        // if (this.searchResult.length > 0){
        //   data = this.searchResult
        // } else {
        //   data = this.dataService.dataTradeSync
        // }   
        data = this.algoService.openPositions     
        break
      case "closedAlgoPositions":
        columns = ['Open Date',	'Status',	'Duration',	'Algorithm',	'Price (GRX)',	'Price (USD)',	'Position Value',	'Position Profit','ROI', 'GRAYLL Transaction ID','Stellar Transaction ID', 'Info']
        fields = ['time','status','duration_string','algorithm_type', 'open_value_GRX','open_value_GRZ','close_position_value_$','close_position_ROI_$', 'close_position_ROI_percent', 'grayll_transaction_id', 'close_stellar_transaction_id', 'url']
        fileName = "ClosedAlgoPositions.PDF"  
        if (this.searchResult.length > 0){
          data = this.searchResult
        } else {
          data = this.algoService.closePositions
        }   
        
        break
      case "allAlgoPositions":
        columns = ['Open Date',	'Status',	'Duration',	'Algorithm',	'Price (GRX)',	'Price (USD)',	'Position Value',	'Position Profit','ROI', 'GRAYLL Transaction ID','Stellar Transaction ID', 'Info']
        fields = ['time','status','duration_string','algorithm_type', 'open_value_GRX','open_value_GRZ','close_position_value_$','close_position_ROI_$', 'close_position_ROI_percent', 'grayll_transaction_id', 'close_stellar_transaction_id', 'url']
        fileName = "AllAlgoPositions.PDF" 
        if (this.searchResult.length > 0){
          data = this.searchResult
        } else {
          data = this.algoService.allPositions
        }   
              
        break
      default:
        console.log('invalid table name')
        return 
    }
    this.sharedService.saveAlgoPDF(columns, fields, data, fileName)
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('ngOnChanges-',changes)
    // console.log('ngOnChanges-', changes.activeTabId)
    if (changes.activeTabId && changes.activeTabId.currentValue) {     
      this.selectedTab = this.activityTabs.find((t) => t.id === changes.activeTabId.currentValue);
    }
    this.searchResult = []
  }

  private setActiveTab() {
    if (this.activeTabId && this.activeTabId !== 'openAlgoPositions' && this.activeTabId !== 'closedAlgoPositions' && this.activeTabId !== 'allAlgoPositions') {
      
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
