import {Component, OnInit, ViewChild} from '@angular/core';
import {faBell, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {CountdownConfig} from 'ngx-countdown/src/countdown.config';
import {AlgoPositionModel} from '../algo-position.model';
import {Router} from '@angular/router';
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

  ) {    
    
    this.selectedTab = this.algoItems[0];
    this.algoPosition = new AlgoPositionModel();
    this.algoPosition.token = this.algoItems[0].token
    this.algoPosition.item = this.algoItems[0].name

    this.authService.countdownConfigs[0] =  {
      leftTime: 60 - (moment.now() - this.authService.gryUpdatedAt)/1000,
      template: '$!s!',
      effect: null,
      demand: false
    };
    console.log(this.authService.countdownConfigs)
  }

  ngOnInit() {
    //this.algoService.initFireStoreDb()
    //this.algoService.getAlgoPositions()
    // this.algoService.algoPositions.subscribe(pos => 
    //   {
    //     pos.forEach( p => {
    //       console.log('data:', p['close_position_ROI_%'])
    //     })
        
    //   })
    this.getDashBoardData()
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
        console.log(e)
      }
    )
  }

  populateMaxGRX() {
    //this.GRXValue = this.totalGRX.toString();
    this.algoPosition.grxAmount = this.authService.getMaxAvailableGRX()
    this.itemChange = 'grxAmountChange' 
    //this.calculateAmount() 
  }
  
  usdAmountChange(){
    // if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue)) {
    //   this.errorService.handleError(null, 'Please enter a valid USD Value.');
    //   return false;
    // }
    // console.log('usdAmountChange')
    this.itemChange = 'usdAmountChange'
    //this.calculateAmount()   
  }
  itemAmountChange(){
    if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
      this.errorService.handleError(null, 'Please enter a valid Amount Value.');
      return false;
    }
    //this.itemChange = 'itemAmountChange'
    console.log('itemAmountChange')
    //this.calculateAmount()
  }
  grxAmountChange(){
    // if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
    //   this.errorService.handleError(null, 'Please enter a valid GRX Amount Value.');
    //   return false;
    // }

    console.log('grxAmountChange')
    this.itemChange = 'grxAmountChange' 
    //this.calculateAmount() 
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
        console.log(this.algoPosition.usdValue)
        console.log(this.authService.priceInfo.grxusd)
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

  didChangeTab(id: string) {
    const algoItem = this.algoItems.find((i) => i.id === id);
    this.selectedTab = algoItem;
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
    console.log('aloPosition:', this.algoPosition)        
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
    // if (!this.algoPosition.usdValue && !this.algoPosition.itemAmount && !this.algoPosition.grxAmount) {
    //   this.errorService.handleError(null, 'Please enter a value of ~$10 or more in one of the fields.');
    //   return false;
    // }
    if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue)) {
      this.errorService.handleError(null, 'Please enter a valid USD Value.');
      return false;
    }
    if (this.algoPosition.usdValue && +this.algoPosition.usdValue < 10) {
      this.errorService.handleError(null, 'Minimum USD Value is $10.');
      return false;
    }
    if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
      this.errorService.handleError(null, 'Please enter a valid GRX Amount.');
      return false;
    }
    if (this.algoPosition.grxAmount && +this.algoPosition.grxAmount < 10) {
      this.errorService.handleError(null, 'Minimum GRX Amount is $10.');
      return false;
    }
    if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
      this.errorService.handleError(null, 'Please enter a valid amount.');
      return false;
    }
    if (this.algoPosition.itemAmount && +this.algoPosition.itemAmount < 10) {
      this.errorService.handleError(null, 'Minimum amount is $10.');
      return false;
    }
    if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
      this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
      return false;
    }
    return true;
  }

    
  private openPopup() {
   
    
    //console.log('this.algoPosition:', this.algoPosition)
    if (this.selectedTab.id != 'GRZ'){
      return
    }
    this.loadingService.show()
    this.stellarService.sendAsset(this.authService.getSecretKey(), environment.HOT_WALLET_ONE, 
      this.algoPosition.grxAmount.toString(), this.stellarService.grxAsset, '').then( txHash => {
        this.algoPosition.stellarTxId = txHash
        this.algoPosition.positionValue = this.algoPosition.usdValue - this.algoPosition.usdValue*+this.selectedTab.fee
        this.sharedService.openAlgoPosition(this.algoPosition);
       if (this.selectedTab.id === 'GRZ'){
          this.http.post(environment.grz_api_url + 'api/v1/grz/position/open', {
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
          }).subscribe(res => {
              if ((res as any).errCode != environment.SUCCESS){               
                this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
              } else {
                //console.log('res:', res)
               this.algoPosition.grayllTxId = (res as any).grayllTxId
               this.algoPosition.stellarTxId = (res as any).stellarTxId
               this.algoPosition.openFee$ = +this.algoPosition.usdValue*+this.selectedTab.fee
               this.algoPosition.positionValueGRX = +this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee
               this.sharedService.openAlgoPosition(this.algoPosition);
               this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
              }
              this.loadingService.hide()
          },
          e => {

            this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
            this.loadingService.hide()
          })
        } else {
          return
          this.http.post(environment.grz_api_url + 'api/v1/gry/position/open', {
            user_id:this.authService.userInfo.Uid,            
            open_stellar_transaction_id:txHash,
            grayll_transaction_id:"0",
            open_position_timestamp:0,
            //algorithm_type:this.algoPosition.id,
            open_value_GRY: this.algoPosition.itemPrice,
            open_value_GRX: this.algoPosition.grxPrice,
            open_position_total_$:+this.algoPosition.usdValue,
            open_position_fee_$:+this.algoPosition.usdValue*+this.selectedTab.fee,
            open_position_fee_GRX:this.algoPosition.grxAmount*+this.selectedTab.fee,
    
            open_position_value_$:this.algoPosition.positionValue,
            open_position_total_GRX:+this.algoPosition.grxAmount,
            open_position_value_GRZ:+this.algoPosition.itemAmount,
            open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*+this.selectedTab.fee),
          }).subscribe( 
            res => {
              if ((res as any).errCode != environment.SUCCESS){
                this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
              } else {
               this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
              }
              this.loadingService.hide()
          },
          e => {
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

}
