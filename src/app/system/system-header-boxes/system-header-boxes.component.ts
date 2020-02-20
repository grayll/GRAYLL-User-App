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
  GRY_FEE = 1.8
  GRZ_FEE = 0.3
  countdownConfig: CountdownConfig = {
    leftTime: 60,
    template: '$!s!',
    effect: null,
    demand: false
  };
  algoItems = [
    {
      id: 'GRY 1',
      name: 'GRY | 1',
      value: 'Balthazar',
      token: 'GRY',
      tabName: 'Balthzr'
    },
    {
      id: 'GRY 2',
      name: 'GRY | 2',
      value: 'Kaspar',
      token: 'GRY',
      tabName: 'Kaspar'
    },
    {
      id: 'GRY 3',
      name: 'GRY | 3',
      value: 'Melkior',
      token: 'GRY',
      tabName: 'Melkior'
    },
    {
      id: 'GRZ',
      name: 'GRZ',
      value: 'Arkady',
      token: 'GRZ',
      tabName: 'Arkady'
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

  ) {
    //this.GRXValue = null;
    //this.totalGRX = 99999999999.99998;
    this.selectedTab = this.algoItems[0];
    this.algoPosition = new AlgoPositionModel(null, this.selectedTab.name, null, null, null, null);
  }

  ngOnInit() {}

  populateMaxGRX() {
    //this.GRXValue = this.totalGRX.toString();
    this.algoPosition.grxAmount = this.authService.getMaxAvailableGRX()
    this.itemChange = 'grxAmountChange' 
    this.calculateAmount() 
  }
  
  usdAmountChange(){
    console.log('usdAmountChange')
    this.itemChange = 'usdAmountChange'
    this.calculateAmount()
   
  }
  itemAmountChange(){
    this.itemChange = 'itemAmountChange'
    console.log('itemAmountChange')
    this.calculateAmount()
  }
  grxAmountChange(){
    console.log('grxAmountChange')
    this.itemChange = 'grxAmountChange' 
    this.calculateAmount() 
  }

  calculateAmount(){
    this.errorService.clearError()
    switch(this.itemChange){
      case 'usdAmountChange':
        if (this.algoPosition.usdValue && !this.isValidNumber(this.algoPosition.usdValue)) {
          this.errorService.handleError(null, 'Please enter a valid USD Value.');
          return false;
        }
  
        if (this.selectedTab === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/+this.authService.userData.grzPrice).toFixed(7)
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRZ_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.grzPrice
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/+this.authService.userData.gryPrice).toFixed(7)
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRY_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.gryPrice
        }
        this.algoPosition.grxAmount = (this.algoPosition.usdValue/+this.authService.userData.grxPrice).toFixed(7)
        break
      case 'itemAmountChange':
        if (this.algoPosition.itemAmount && !this.isValidNumber(this.algoPosition.itemAmount)) {
          this.errorService.handleError(null, 'Please enter a valid Amount Value.');
          return false;
        }
  
        if (this.selectedTab === 'GRZ'){
          this.algoPosition.usdValue = this.algoPosition.itemAmount*+this.authService.userData.grzPrice
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRZ_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.grzPrice
        } else {
          this.algoPosition.usdValue = this.algoPosition.itemAmount*+this.authService.userData.gryPrice
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRY_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.gryPrice
        }
        this.algoPosition.grxAmount = (this.algoPosition.usdValue/+this.authService.userData.grxPrice).toFixed(7)
        break
      case 'grxAmountChange':
        if (this.algoPosition.grxAmount && !this.isValidNumber(this.algoPosition.grxAmount)) {
          this.errorService.handleError(null, 'Please enter a valid GRX Amount Value.');
          return false;
        }
        
        this.algoPosition.usdValue = +(this.algoPosition.grxAmount*+this.authService.userData.grxPrice).toFixed(7)
        if (this.selectedTab === 'GRZ'){
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/+this.authService.userData.grzPrice).toFixed(7)
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRZ_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.grzPrice
        } else {
          this.algoPosition.itemAmount = (this.algoPosition.usdValue/+this.authService.userData.gryPrice).toFixed(7)
          this.algoPosition.positionValue = this.algoPosition.usdValue*(100 - this.GRY_FEE)/100
          this.algoPosition.itemPrice = this.authService.userData.gryPrice
        }
        break
    }  
    if (this.algoPosition.grxAmount > this.authService.getMaxAvailableGRX()) {
      this.errorService.handleError(null, 'Insufficient balance. Please deposit more GRX to open position.');
      return false;
    }
    this.algoPosition.grxPrice = this.authService.userData.grxPrice  
  }

  didChangeTab(id: string) {
    const algoItem = this.algoItems.find((i) => i.id === id);
    this.selectedTab = algoItem;
    this.algoPosition.item = algoItem.name;
    console.log('didChangeTab', this.selectedTab)
    if (this.algoPosition.usdValue){
      if (this.selectedTab.id === 'GRZ' ){
        console.log('didChangeTab')
        this.algoPosition.itemAmount = this.algoPosition.usdValue/+this.authService.userData.grzPrice
      } else {
        this.algoPosition.itemAmount = this.algoPosition.usdValue/+this.authService.userData.gryPrice
      }
    }

  }

  scrollToSystemActivity() {
    const el = document.getElementById('systemActivityTable');
    el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

  openAlgoPosition() {
    this.errorService.clearError();
    if (this.clientValidation()) {

      this.populateAlgoModel();
      this.openPopup();
    }
  }

  private clientValidation(): boolean {
    if (!this.algoPosition.usdValue && !this.algoPosition.itemAmount && !this.algoPosition.grxAmount) {
      this.errorService.handleError(null, 'Please enter a value of ~$10 or more in one of the fields.');
      return false;
    }
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
    return true;
  }

  private populateAlgoModel() {
    // this.algoPosition.grxAmount = +this.GRXValue;
    // this.algoPosition.itemAmount = +this.algoPosition.itemAmount;
    // this.algoPosition.usdValue = +this.algoPosition.usdValue;
    this.algoPosition.token = this.selectedTab.id;
  }

  // OpenPositionRequest struct {
	// 	UserId                int64   `json:"user_id"`
	// 	StellarTxId           string  `json:"stellar_transaction_id"`
	// 	GrayllTxId            string  `json:"grayll_transaction_id"`
	// 	OpenPositionTimestamp int64   `json:"open_position_timestamp"`
	// 	AlgoType              string  `json:"algorithm_type"`
	// 	GrzPrice              float64 `json:"grz_price"`
	// 	GrxPrice              float64 `json:"grx_price"`
	// 	OpenPositionTotalUSD  float64 `json:"open_position_total_$"`
	// 	OpenPositionFeeUSD    float64 `json:"open_position_fee_$"`
	// 	OpenPositionFeeGRX    float64 `json:"open_position_fee_GRX"`
	// 	OpenPositionValueUSD  float64 `json:"open_position_value_$"`
	// 	OpenPositionTotalGRX  float64 `json:"open_position_total_GRX"`
	// 	OpenPositionValueGRZ  float64 `json:"open_position_value_GRZ"`
	// 	OpenPositionValueGRX  float64 `json:"open_position_value_GRX"`
	// }

  private openPopup() {
    this.sharedService.openAlgoPosition(this.algoPosition);
    console.log('this.algoPosition:', this.algoPosition)
    this.stellarService.sendAsset(this.authService.getSecretKey(), environment.XLM_LOAN_ADDRESS, 
      this.algoPosition.grxAmount.toString(), this.stellarService.grxAsset, '').then( ledgerId => {
        this.algoPosition.stellarTxId = ledgerId
        if (this.algoPosition.item === 'GRZ'){
          this.http.post('https://grayll-test-oivbo7uxva-uc.a.run.app/grz/positions/create', {
            //user_id:this.authService.userInfo.Uid,
            user_id:1000,
            stellar_transaction_id:ledgerId.toString(),
            grayll_transaction_id:"0",
            open_position_timestamp:0,
            algorithm_type:this.algoPosition.id,
            grz_price: this.algoPosition.itemPrice,
            grx_price: this.algoPosition.grxPrice,
            open_position_total_$:+this.algoPosition.usdValue,
            open_position_fee_$:+this.algoPosition.usdValue*this.GRZ_FEE,
            open_position_fee_GRX:this.algoPosition.grxAmount*this.GRZ_FEE,
    
            open_position_value_$:this.algoPosition.positionValue,
            open_position_total_GRX:+this.algoPosition.grxAmount,
            open_position_value_GRZ:+this.algoPosition.itemAmount,
            open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*this.GRZ_FEE),
          }).subscribe( res => {
            console.log(res)
            this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
          })
        } else {
          this.http.post('https://grayll-test-oivbo7uxva-uc.a.run.app/gry/positions/create', {
            //user_id:this.authService.userInfo.Uid,
            user_id:1000,
            stellar_transaction_id:ledgerId.toString(),
            grayll_transaction_id:"0",
            open_position_timestamp:0,
            algorithm_type:this.algoPosition.id,
            grz_price: this.algoPosition.itemPrice,
            grx_price: this.algoPosition.grxPrice,
            open_position_total_$:+this.algoPosition.usdValue,
            open_position_fee_$:+this.algoPosition.usdValue*this.GRY_FEE,
            open_position_fee_GRX:this.algoPosition.grxAmount*this.GRY_FEE,
    
            open_position_value_$:this.algoPosition.positionValue,
            open_position_total_GRX:+this.algoPosition.grxAmount,
            open_position_value_GRZ:+this.algoPosition.itemAmount,
            open_position_value_GRX:(+this.algoPosition.grxAmount - +this.algoPosition.grxAmount*this.GRY_FEE),
          }).subscribe( res => {
            this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
          })
        }
      }).catch( e => {
        console.log(e)
      })
    
        
    
  }

  

  private isValidNumber(value: string): boolean {
    const num = Number(value);
    return !isNaN(num);
  }

  openModal(id: string) {
    this.customModalService.open(id);
  }

  swipeLeft() {
    this.carouselSystem.next();
  }

  swipeRight() {
    this.carouselSystem.prev();
  }

}
