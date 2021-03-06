import {Component, OnInit, ViewChild} from '@angular/core';
import {faBell, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {CountdownConfig} from 'ngx-countdown/src/countdown.config';
import {AlgoPositionModel} from '../algo-position.model';
import {Router, ActivatedRoute} from '@angular/router';
import {SharedService} from '../../shared/shared.service';
import {ErrorService} from '../../shared/error/error.service';
import {CustomModalService} from '../../shared/custom-modal.service';
import {NotificationsService} from '../../notifications/notifications.service';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { environment } from 'src/environments/environment'
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AlgoService } from '../algo.service';
import * as moment from 'moment';
import { AdminService } from 'src/app/admin/admin.service';
import { PopupService } from 'src/app/shared/popup/popup.service';

@Component({
  selector: 'app-system-header-boxes',
  templateUrl: './system-header-boxes.component.html',
  styleUrls: ['./system-header-boxes.component.scss']
})
export class SystemHeaderBoxesComponent implements OnInit {

  @ViewChild(NgbCarousel) carouselSystem;

  //GRXValue: string;
  totalGRX: number;
  selectedTab: any;
  algoPosition: AlgoPositionModel;
  // itemChange to detect which is calculated from (usd,gry,grx)
  itemChange: string
  //GRY_FEE = 1.8
  //GRZ_FEE = 0.3
  grydb:any
  grzdb:any
  
  algoItems = [
    {
      id: 'GRY 1',
      name: 'GRY | 1',
      value: 'Balthazar',
      token: 'GRY',
      tabName: 'Balthzr',
      fee: 0.018
    },
    {
      id: 'GRY 2',
      name: 'GRY | 2',
      value: 'Kaspar',
      token: 'GRY',
      tabName: 'Kaspar',
      fee: 0.013
    },
    {
      id: 'GRY 3',
      name: 'GRY | 3',
      value: 'Melkior',
      token: 'GRY',
      tabName: 'Melkior',
      fee: 0.009
    },
    {
      id: 'GRZ',
      name: 'GRZ',
      value: 'Arkady',
      token: 'GRZ',
      tabName: 'Arkady',
      fee: 0.003
    }
  ];

  // Font Awesome Icons
  faInfo = faInfoCircle;
  faBell = faBell;
  
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private errorService: ErrorService,
    private customModalService: CustomModalService,
    public notificationsService: NotificationsService,
    public authService: AuthService,
    public stellarService: StellarService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private algoService: AlgoService,
    private adminService: AdminService,
    public popupService: PopupService,
    private route: ActivatedRoute,
  ) {    
    
    this.selectedTab = this.algoItems[0];
    this.algoPosition = new AlgoPositionModel();
    this.algoPosition.id = this.algoItems[0].id
    this.algoPosition.token = this.algoItems[0].token
    this.algoPosition.item = this.algoItems[0].name
    
    this.authService.countdownConfigs[0] =  {
      leftTime: 60 - (moment.now() - this.authService.gryUpdatedAt)/1000,
      template: '$!s!',
      effect: null,
      demand: false
    };    
  }

  ngOnInit() {    
    this.getDashBoardData()
    this.getAlgoRoi()
  }

  getDashBoardData(){
    this.http.get("api/v1/users/GetDashBoardInfoGet/gryusd,grzusd").subscribe(
      data => {       
        let res = data as any      
        if (res.db.gryusd){ 
          this.grydb = res.db.gryusd          
        }
        if (res.db.grzusd){ 
          this.grzdb = res.db.grzusd
        }        
      },
      e => {
        //console.log(e)
      }
    )
  }
  getAlgoRoi(){
    this.http.get("api/v1/users/getalgoroi").subscribe(
      data => {       
        let res = data as any 
       
        this.algoService.gry1MetricROI.OneDayPercent = res.gry1s[0]   
        this.algoService.gry1MetricROI.SevenDayPercent = res.gry1s[1] 
        this.algoService.gry1MetricROI.ROIPercent = res.gry1s[2] 

        this.algoService.gry2MetricROI.OneDayPercent = res.gry2s[0]   
        this.algoService.gry2MetricROI.SevenDayPercent = res.gry2s[1] 
        this.algoService.gry2MetricROI.ROIPercent = res.gry2s[2] 

        this.algoService.gry3MetricROI.OneDayPercent = res.gry3s[0]   
        this.algoService.gry3MetricROI.SevenDayPercent = res.gry3s[1] 
        this.algoService.gry3MetricROI.ROIPercent = res.gry3s[2] 

        this.algoService.grzMetricROI.OneDayPercent = res.grzs[0]   
        this.algoService.grzMetricROI.SevenDayPercent = res.grzs[1] 
        this.algoService.grzMetricROI.ROIPercent = res.grzs[2] 
      },
      e => {
        //console.log(e)
      }
    )
  }

  populateMaxGRX() {    
    this.algoPosition.grxAmount = this.authService.getMaxAvailableGRX()
    this.itemChange = 'grxAmountChange'    
  }
  
  usdAmountChange(){    
    this.itemChange = 'usdAmountChange'    
  }
  itemAmountChange(){
    if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
      this.errorService.handleError(null, 'Please enter a valid Amount Value.');
      return false;
    }   
    //console.log('itemAmountChange')    
  }
  grxAmountChange(){    
    //console.log('grxAmountChange')
    this.itemChange = 'grxAmountChange' 
    
  }

  calculateAmount(){
    this.errorService.clearError()
    switch(this.itemChange){
      case 'usdAmountChange':
        if (!this.algoPosition.usdValue){
          this.algoPosition.itemAmount = ''
          this.algoPosition.grxAmount = ''
          return '';
        }
        if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue) ) {
          this.errorService.handleError(null, 'Please enter a valid USD Value.');
          this.algoPosition.itemAmount = ''

          return '';
        }
          
        if (this.selectedTab.id === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grzusd).toFixed(7)         
          this.algoPosition.itemPrice = this.authService.priceInfo.grzusd
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.gryusd).toFixed(7)          
          this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
        }
        
        //console.log(this.algoPosition.usdValue)
        //console.log(this.authService.priceInfo.grxusd)
        this.algoPosition.grxAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grxusd).toFixed(7)
        if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
          this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
          return this.algoPosition.usdValue;
        }
        this.algoPosition.grxPrice = this.authService.priceInfo.grxusd
        return this.algoPosition.usdValue      
      case 'grxAmountChange':
        if (!this.algoPosition.grxAmount){
          this.algoPosition.itemAmount = ''
          this.algoPosition.usdValue = ''
          return '';
        }
        
        if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
          this.errorService.handleError(null, 'Please enter a valid GRX Amount Value.');
          this.algoPosition.itemAmount = ''
          this.algoPosition.usdValue = ''
          return '';
        }
        
        this.algoPosition.usdValue = +(+this.algoPosition.grxAmount*this.authService.priceInfo.grxusd).toFixed(7)        
        if (this.selectedTab.id === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grzusd).toFixed(7)          
          this.algoPosition.itemPrice = this.authService.priceInfo.grzusd
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.gryusd).toFixed(7)
          
          this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
        }
        
        if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
          this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
          return this.algoPosition.grxAmount;
        }
        this.algoPosition.grxPrice = this.authService.priceInfo.grxusd  
        return this.algoPosition.grxAmount
        //break
    } 
  }

 

  didChangeTab(id: string) {
    const algoItem = this.algoItems.find((i) => i.id === id);
    this.selectedTab = algoItem;
    this.algoPosition.id =  algoItem.id
    this.algoPosition.item = algoItem.name;
    this.algoPosition.token = algoItem.token;
    
    if (this.selectedTab.id === 'GRZ' ){
      if (this.algoPosition.usdValue && this.isValidNumber(this.algoPosition.usdValue) ){
        this.algoPosition.itemAmount = this.algoPosition.usdValue/this.authService.priceInfo.grzusd        
      }    
      this.algoPosition.itemPrice = this.authService.priceInfo.grzusd

      this.authService.countdownConfigs[1] =  {
        leftTime: 60 - (moment.now() - this.authService.grzUpdatedAt)/1000,
        template: '$!s!',
        effect: null,
        demand: false
      };
      
    } else {
      if (this.algoPosition.usdValue && this.isValidNumber(this.algoPosition.usdValue) ){
        this.algoPosition.itemAmount = this.algoPosition.usdValue/this.authService.priceInfo.gryusd
      }
      this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
      this.authService.countdownConfigs[0] =  {
        leftTime: 60 - (moment.now() - this.authService.gryUpdatedAt)/1000,
        template: '$!s!',
        effect: null,
        demand: false
      };      
    }
    //console.log('aloPosition:', this.algoPosition)        
  }

  scrollToSystemActivity() {
    const el = document.getElementById('systemActivityTable');
    el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

  openAlgoPosition() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      this.openPopup();
    }
  }

  private clientValidation(): boolean {

    if (!this.algoPosition.usdValue || !this.algoPosition.grxAmount){
      return false
    }
        
    if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue)) {
      this.errorService.handleError(null, 'Please enter a valid USD Value.');
      return false;
    }
    if (this.algoPosition.usdValue && +this.algoPosition.usdValue < 100) {
      this.errorService.handleError(null, 'Minimum USD Value is $100.');
      return false;
    }
    if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
      this.errorService.handleError(null, 'Please enter a valid GRX Amount.');
      return false;
    }
    if (this.algoPosition.grxAmount && +this.algoPosition.grxAmount < 100) {
      this.errorService.handleError(null, 'Minimum GRX Amount is $100.');
      return false;
    }
    if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
      this.errorService.handleError(null, 'Please enter a valid amount.');
      return false;
    }
    if (this.algoPosition.itemAmount && +this.algoPosition.itemAmount < 100) {
      this.errorService.handleError(null, 'Minimum amount is $100.');
      return false;
    }
    if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
      this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
      return false;
    }
    return true;
  }

    
  private openPopup() {
    if (this.authService.isTokenExpired()){
      return
    }
    if (this.adminService.show(this.selectedTab.id)){
      return
    }
    // this.algoService.subRetrySuccess()
    // this.algoService.retrySuccess.subscribe(()=> {
    //   console.log('received open success')
    //   this.popupService.close().then(() => {
    //     setTimeout(() => {
    //       //this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
    //       this.router.navigate([{outlets: {popup: 'open-algo-position-success'}}], {relativeTo: this.route});
    //     }, 10);
    //   })
    //   .catch((error) => console.log(error));
      
    // })
      
    this.loadingService.show()
    this.sharedService.openAlgoPosition(this.algoPosition);
    this.stellarService.sendAsset(this.authService.getSecretKey(), environment.HOT_WALLET_ONE, 
      this.algoPosition.grxAmount.toString(), this.stellarService.grxAsset, this.selectedTab.id).then( txHash => {
        if (txHash == ''){
          this.loadingService.hide()
          this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
          return
        }
        this.algoPosition.stellarTxId = txHash
        this.algoPosition.positionValue = this.algoPosition.usdValue - this.algoPosition.usdValue*+this.selectedTab.fee       
       
       if (this.selectedTab.id === 'GRZ'){
         let data =  {
            user_id:this.authService.userInfo.Uid,            
            open_stellar_transaction_id:txHash,            
            grayll_transaction_id:"0",
            open_position_timestamp:0,
            algorithm_type:this.selectedTab.id,
            open_value_GRZ: this.algoPosition.itemPrice,
            open_value_GRX: this.algoPosition.grxPrice,
            open_position_total_$:+this.algoPosition.usdValue,
            open_position_fee_$:+this.algoPosition.usdValue*+this.selectedTab.fee,
            open_position_fee_GRX:+this.algoPosition.grxAmount*+this.selectedTab.fee,
            duration:0,
            current_position_ROI_$:0,
            current_position_ROI_percent:0,
            //open_position_value_$:this.algoPosition.positionValue,
            open_position_value_$: this.algoPosition.usdValue - this.algoPosition.usdValue*+this.selectedTab.fee,
            open_position_total_GRX:+this.algoPosition.grxAmount,
            open_position_value_GRZ:+this.algoPosition.itemAmount - +this.algoPosition.itemAmount*+this.selectedTab.fee,
            open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee),
          }

          this.algoPosition.openFee$ = +this.algoPosition.usdValue*+this.selectedTab.fee
          this.algoPosition.positionValueGRX = +this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee
          
          this.algoService.currentOpenPosition = data
          this.algoService.currentURL =  environment.grz_api_url + 'api/v1/grz/position/open'
          this.algoService.currentPositionModel = this.algoPosition
          this.sharedService.openAlgoPosition(this.algoPosition);
          this.http.post(this.algoService.currentURL, data).subscribe(res => {             
              let errCode = (res as any).errCode
              if (errCode != environment.SUCCESS ){     
                // save data to retry  
                if (errCode != environment.TX_IN_USED || errCode != environment.INTERNAL_ERROR_RETRY){
                  this.algoService.currentOpenPosition = null
                }
                this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
              } else {
               
               this.algoPosition.grayllTxId = (res as any).grayllTxId
               this.algoPosition.stellarTxId = (res as any).stellarTxId
               this.algoService.currentOpenPosition = null
               this.sharedService.openAlgoPosition(this.algoPosition);
               this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
              }
              this.loadingService.hide()
          },
          e => {
            //console.log('ex:', e)
            this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
            this.loadingService.hide()
          })
        } else { // post for gry
          let data = {
            user_id:this.authService.userInfo.Uid,            
            open_stellar_transaction_id:txHash,
            grayll_transaction_id:"0",
            open_position_timestamp:0,
            algorithm_type:this.selectedTab.id,
            open_value_GRY: this.algoPosition.itemPrice,
            open_value_GRX: this.algoPosition.grxPrice,
            open_position_total_$:+this.algoPosition.usdValue,
            open_position_fee_$:+this.algoPosition.usdValue*+this.selectedTab.fee,
            open_position_fee_GRX:+this.algoPosition.grxAmount*+this.selectedTab.fee,
            duration:0,
            current_position_ROI_$:0,
            current_position_ROI_percent:0,            
            open_position_value_$: this.algoPosition.usdValue - this.algoPosition.usdValue*+this.selectedTab.fee,
            open_position_total_GRX:+this.algoPosition.grxAmount,
            open_position_value_GRY:+this.algoPosition.itemAmount - +this.algoPosition.itemAmount*+this.selectedTab.fee,
            open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee),
          }
          let url = ''
          switch(this.selectedTab.id){
            case "GRY 1":
              url = environment.gry1_api_url + 'api/v1/gry/position/open'
              break
            case "GRY 2":
              url = environment.gry2_api_url + 'api/v1/gry/position/open'
              break
            case "GRY 3":
              url = environment.gry3_api_url + 'api/v1/gry/position/open'
              break
          }
          // save data to retry  
          this.algoPosition.openFee$ = +this.algoPosition.usdValue*+this.selectedTab.fee
          this.algoPosition.positionValueGRX = +this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee

          this.algoService.currentOpenPosition = data
          this.algoService.currentURL =  url
          this.algoService.currentPositionModel = this.algoPosition
          this.sharedService.openAlgoPosition(this.algoPosition);

          this.http.post(url, data).subscribe(res => {
            let errCode = (res as any).errCode
            if (errCode != environment.SUCCESS ){     
              // save data to retry  
              if (errCode != environment.TX_IN_USED || errCode != environment.INTERNAL_ERROR_RETRY){
                this.algoService.currentOpenPosition = null
              }        
              this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
            } else {
              //console.log('res:', res)
              this.algoPosition.grayllTxId = (res as any).grayllTxId
              this.algoPosition.stellarTxId = (res as any).stellarTxId
              this.algoService.currentOpenPosition = null
              this.sharedService.openAlgoPosition(this.algoPosition);
              this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
            }
            this.loadingService.hide()
          },
          e => {
            console.log(e)
            this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
            this.loadingService.hide()
          })          
        }
      }).catch( e => {
        console.log(e)
        this.loadingService.hide()
        this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
      })
  }

  

  private isValidNumber(value: string): boolean {
    const num = Number(value);
    return !isNaN(num);
  }

  openModal(id: string) {
    this.algoService.noticeId = id
    this.customModalService.open(id);
  }

  swipeLeft() {
    this.carouselSystem.next();
  }

  swipeRight() {
    this.carouselSystem.prev();
  }

  calculateAmountBK(){
    this.errorService.clearError()
    switch(this.itemChange){
      case 'usdAmountChange':
        if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue)) {
          this.errorService.handleError(null, 'Please enter a valid USD Value.');
          return false;
        }
  
        if (this.selectedTab.id === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grzusd).toFixed(7)        
          this.algoPosition.itemPrice = this.authService.priceInfo.grzusd
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.gryusd).toFixed(7)
          
          this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
        }
        this.algoPosition.positionValue = this.algoPosition.usdValue - +this.selectedTab.fee*this.algoPosition.usdValue
        // console.log(this.algoPosition.usdValue)
        // console.log(this.authService.priceInfo.grxusd)
        this.algoPosition.grxAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grxusd).toFixed(7)
        break
      case 'itemAmountChange':
        if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
          this.errorService.handleError(null, 'Please enter a valid Amount Value.');
          return false;
        }
  
        if (this.selectedTab.id === 'GRZ'){
          this.algoPosition.usdValue = +this.algoPosition.itemAmount*this.authService.priceInfo.grzusd          
          this.algoPosition.itemPrice = this.authService.priceInfo.grzusd
        } else {
          this.algoPosition.usdValue = +this.algoPosition.itemAmount*this.authService.priceInfo.gryusd          
          this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
        }
        this.algoPosition.positionValue = this.algoPosition.usdValue - +this.selectedTab.fee*this.algoPosition.usdValue
        this.algoPosition.grxAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grxusd).toFixed(7)
        break
      case 'grxAmountChange':
        if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
          this.errorService.handleError(null, 'Please enter a valid GRX Amount Value.');
          return false;
        }
        
        this.algoPosition.usdValue = +(+this.algoPosition.grxAmount*this.authService.priceInfo.grxusd).toFixed(7)
        this.algoPosition.positionValue = this.algoPosition.usdValue - +this.selectedTab.fee*this.algoPosition.usdValue
        if (this.selectedTab.id === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.grzusd).toFixed(7)
          
          this.algoPosition.itemPrice = this.authService.priceInfo.grzusd
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/this.authService.priceInfo.gryusd).toFixed(7)
          
          this.algoPosition.itemPrice = this.authService.priceInfo.gryusd
        }
        break
    }  
    if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
      this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
      return false;
    }
    this.algoPosition.grxPrice = this.authService.priceInfo.grxusd  
  }

}
