import {Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, OnChanges} from '@angular/core';
import {faArrowAltCircleDown, faCopy, faInfoCircle, faSearch, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {SubSink} from 'subsink';

//import {OrderModel} from './models/order.model';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import {ActivityResult} from './models/activity-results';
import {PopupService} from 'src/app/shared/popup/popup.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { NoticeId, OrderId, Notice, Order } from 'src/app/notifications/notification.model';
import { Observable, of } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { AccountActivityService } from './account-activity.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

var StellarSdk = require('stellar-sdk')

@Component({
  selector: 'app-account-activity',
  templateUrl: './account-activity.component.html',
  styleUrls: ['./account-activity.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class AccountActivityComponent implements OnInit, OnDestroy, OnChanges {

  @Input() showMoreDetails: boolean;
  @Input() activeTabId: string;
  @Input() showAllCompletedOrders: boolean;
  @Input() scrollToCompletedOrders: boolean;
  @Input() shouldReload: boolean;

  selectedTab: {id: string, name: string};
  activityTabs = [
    {
      id: 'allOrders',
      name: 'All Orders'
    },
    {
      id: 'transfers',
      name: 'Transfers'
    },
    {
      id: 'networkHistory',
      name: 'Network History'
    }
  ];

  offers: any;
  trades: any;
  payments: any[];
  operations: any;  
  account: any
  grxP:number
  xlmP:number
  subs: SubSink

  // Font Awesome Icons
  faDownload = faArrowAltCircleDown;
  faClose = faTimesCircle;
  faInfo = faInfoCircle;
  faCopy = faCopy;
  faSearch = faSearch;
  activityResult: ActivityResult
  item: any
  notices: Observable<NoticeId[]>;
  tradess: Observable<OrderId[]>;
  private debounce: number = 400;
  isInitData: boolean = true  

  searchControl: FormControl;

  searchResult: any[];

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private stellarService: StellarService,
    private authService: AuthService,
    private router: Router,
    private sharedService:SharedService,
    private popupService: PopupService,
    private dataService:NoticeDataService,
    private loadingService: LoadingService,
    private accountService: AccountActivityService
  ) {
    
    this.subs = new SubSink()
    this.selectedTab = this.activityTabs[0];
    this.activityResult = new ActivityResult()

    this.stellarService.allOffers = null
    this.stellarService.trades = null 
    this.authService.reload = false
    this.getAccountOrders(null, true)
    this.getAccTrades()    
    
    this.grxP = +this.authService.userData.grxPrice
    this.xlmP = +this.authService.userData.xlmPrice
    this.stellarService.getAccountData(this.authService.userData.PublicKey)
    .catch(err => {
      // Notify internet connection.
      this.snotifyService.simple('Please check your internet connection.')
      console.log(err)
    })

    this.isInitData = false
  }

  ngOnInit() {
    this.setActiveTab();    
    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        if (query) {  
          console.log('query:',query)        
          this.accountService.searchData(this.activeTabId, this.authService.userInfo.Uid, query).then(data => {
            console.log(data.hits)
            if(this.activeTabId === 'networkHistory'){
              
            } else if(this.activeTabId === 'transfers'){
              this.searchResult = (data.hits as Notice[]).map(item => {
                return this.dataService.parseTransfer(item)
              })
              this.notices = of(this.searchResult)             
            } else {              
              this.searchResult = (data.hits as OrderId[]).map(item => {
                return this.dataService.parseTrade(item)
              })
              this.tradess = of(this.searchResult)
            }
          }).catch(e => {
            console.log(e)
          })
        }
      });    
  }

  ngOnChanges() {    
    console.log('change:', this.shouldReload);
    this.searchResult = []
    this.stellarService.allOffers = null
    if (this.authService.reload){
      this.getAccountOrders(null, true)
      this.grxP = +this.authService.userData.grxPrice
      this.xlmP = +this.authService.userData.xlmPrice
    }
    
  }
  downloadHistory(){
    console.log('this.selectedTab.id:', this.selectedTab.id)
    
    switch(this.selectedTab.id){
      case 'allOrders':
        this.download('order')
        break
      case 'transfers':
        this.download('transfer')
        break
      case 'networkHistory':
        this.download('network')
        break
    }
  }

  download(table:string){
    var fields = []
    var columns = []
    var fileName = ''
    var data:any
    switch (table){
      case "order":
        columns = ['Date',	'Type',	'Asset',	'Amount',	'Filled',	'Price (XLM)',	'Total Price (XLM)',	'Price (USD)',	'Total Price (USD)', 'URL']
        fields = ['times','type','asset','amount', 'filled','xlmp','totalxlm','priceusd', 'totalusd', 'url']
        fileName = "OrderHistory.PDF"        
        if (this.searchResult.length > 0){
          data = this.searchResult
        } else {
          data = this.dataService.dataTradeSync
        }        
        break
      case "transfer":
        columns = ['Date',	'Counterparty',	'Asset', 'Issuer',	'Amount', 'Url']
        fields = ['times','counter','asset', 'issuer', 'amount', 'url']
        fileName = "TransferHistory.PDF"
        if (this.searchResult.length > 0){
          data = this.searchResult
        } else {
          data = this.dataService.dataPaymentsSync      
        }   
        break
      case "network":
          columns = ['Date',	'Operation', 'ID', 'Amount',	'Asset', 'Account', 'Url']
          fields = ['time','op', 'id', 'amount', 'asset', 'account', 'url']
          fileName = "NetworkHistory.PDF"
          data = this.operations          
        break
      default:
        console.log('invalid table name')
        return 
    }
    this.sharedService.savePDF(columns, fields, data, fileName)
  }
  
  validateSession(){
    if (this.authService.isTokenExpired()){
      this.snotifyService.simple('Your login session has expired! Please login again.'); 
      this.router.navigateByUrl('/login')
      return false
    } 
      
    return true  
  }

  cancelOffer(item){  
    this.item = item 
    if(!this.validateSession()){
      return
    }    
    console.log('cancelOffer-cachedOffer:', item.cachedOffer) 
    this.cancelCurrentOffer(this.item)    
      
  }
  async cancelCurrentOffer1(item){    
      try {   
        let xdr = await this.stellarService.getCancelOfferXdr(this.authService.userInfo.PublicKey, item.cachedOffer)
        this.authService.makeTransaction(xdr, "cancel").subscribe(res => {
          //console.log(res)
          if ((res as any).errCode == "tx_success"){                          
            this.stellarService.allOffers.splice(item.index, 1)
            if (this.authService.userMetaStore.OpenOrders){
              this.authService.userMetaStore.OpenOrders -=1
            } else {
              this.authService.userMetaStore.OpenOrders = 0
            }
            if (this.authService.userMetaStore.OpenOrders < 0){
              this.authService.userMetaStore.OpenOrders = 0
            }
            if (item.assetType === 'GRX'){
              this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX + +item.realAmount
            } else if(item.assetType === 'XLM'){
              this.authService.userMetaStore.XLM = +this.authService.userMetaStore.XLM + +item.realAmount
            }
          } else {
            this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
          }
        })       
      } catch(e ) {
        console.log('cancelOffer error:', e)
        if (e.toString().includes('status code 400')){
          this.snotifyService.simple('Insufficient funds to cancel this order! Please add more funds to your account.')  
        } else {
          this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
        }
      }
    
  }
  cancelCurrentOffer(item){
    //this.authService.GetSecretKey(null).then(SecKey => {     
      this.loadingService.show() 
      this.stellarService.cancelOffer(this.authService.getSecretKey(), item.cachedOffer, this.authService.userMetaStore, item.realAmount, item.assetType).then(res=>
        {    
          console.log('cancelCurrentOffer a', this.authService.userMetaStore, item.assetType, item.realAmount)                 
          this.stellarService.allOffers.splice(item.index, 1)
          if (this.authService.userMetaStore.OpenOrders){
            this.authService.userMetaStore.OpenOrders -=1
          } 
          if (this.authService.userMetaStore.OpenOrders < 0){
            this.authService.userMetaStore.OpenOrders = 0
          }
                   
          if(item.assetType === 'XLM'){                        
            this.authService.userMetaStore.OpenOrdersXLM = +this.authService.userMetaStore.OpenOrdersXLM - +item.realAmount
            console.log('cancelCurrentOffer 21', this.authService.userMetaStore, item.assetType, item.realAmount) 
          } else {
            this.authService.userMetaStore.OpenOrdersGRX = +this.authService.userMetaStore.OpenOrdersGRX - +item.realAmount
          }
          
          this.loadingService.hide()
          // if (this.authService.userMetaStore.OpenOrders){
          //   this.authService.userMetaStore.OpenOrders -=1
          // } else {
          //   this.authService.userMetaStore.OpenOrders = 0
          // }
          // if (this.authService.userMetaStore.OpenOrders < 0){
          //   this.authService.userMetaStore.OpenOrders = 0
          // }
          //this.authService.SetLocalUserData()    
        }
      ).catch(e => {
        this.loadingService.hide()
        console.log('cancelOffer error:', e)
        if (e.toString().includes('status code 400')){
          this.snotifyService.simple('Insufficient funds to cancel this order! Please add more funds to your account.')  
        } else {
          this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
        }
      })
    //})
  }

  parseAsset(asset) {
    if (asset.asset_type == 'native') {
      return StellarSdk.Asset.native();
    } else {
      return new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
    }
  }
  private setActiveTab() {
    if (this.activeTabId) {
      this.selectedTab = this.activityTabs.find((t) => t.id === this.activeTabId);
      if (this.scrollToCompletedOrders) {
        setTimeout(() => {
          console.log('scrollToCompletedOrders')
          const el = document.getElementById('completedOrdersContainer');
          el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }, 500);
      }
    }
  }
  
 
  onScrollOpenOrders() {
    if (this.activityResult.openOrderNextURL && this.activityResult.openOrderEmptyResultTimes < 3){
      console.log('onScrollTransfers called get')
      this.getAccountOrders(this.activityResult.openOrderNextURL, true)
    } else {
      console.log('onScrollTransfers !!! called get:', this.activityResult.openOrderEmptyResultTimes)
    }
  }
  
  onScrollCompletedOrders() {
    if (this.activityResult.completedOrderNextURL && this.activityResult.completedOrderEmptyResultTimes < 3){
      console.log('onScrollTransfers called get')
      this.getAccountTrades(this.activityResult.completedOrderNextURL)
    } else {
      console.log('onScrollTransfers !!! called get:', this.activityResult.completedOrderEmptyResultTimes)
    }
  }
  
  onScrollNetworkHistory() {
    //this.populateNetworkHistory();
  }
  
  onScrollTransfers() {    
    if (this.activityResult.paymentNextURL && this.activityResult.paymentEmptyResultTimes < 3){
      console.log('onScrollTransfers called get')
      this.getAccountPayments(this.activityResult.paymentNextURL)
    } else {
      console.log('onScrollTransfers !!! called get:', this.activityResult.paymentEmptyResultTimes)
    }
  }

  getAccPayments(){
    let walletPath = 'notices/wallet/'+this.authService.userData.Uid
    this.dataService.getPaymentHistory(walletPath, 200)
    this.notices = this.dataService.data
  }
  getAccTrades(){
    let path = 'trades/users/'+this.authService.userData.Uid
    this.dataService.getTradeHistory(path, 200)
    this.tradess = this.dataService.dataTrade
  }

  getAccountPayments(nextURL:string){
    this.stellarService.getPayment(this.authService.userData.PublicKey, 20, nextURL).then(pms => {          
      if (pms && pms.data._embedded.records.length > 0){
        var records: any[] = pms.data._embedded.records.filter(item => {
          if (item.type === "payment"){
            return item
          } 
        }).map (item => {                
          if (item.type === "payment"){                  
            let time =  moment.utc(item.created_at).local().format('DD/MM/YYYY HH:mm:ss')
            let asset = ''
            let issuer  = ''
            if (item.asset_type === 'native'){
              asset = 'XLM'
              issuer = 'Stellar'
            } else {
              asset = item.asset_code
              issuer = 'grayll.io'
            }
            let counter = ''
            let amount = ''
            if (item.from === this.authService.userData.PublicKey){
              counter = item.to
              amount = '-' + item.amount
            } else {
              counter = item.from
              amount = '+' + item.amount
            }
            counter = this.trimAddress(counter) // counter.slice(0, 6) + '...' + counter.slice( counter.length-7, counter.length-1)
            let url = 'https://stellar.expert/explorer/public/search?term='+item.id 
            
            return {time:time, counter:counter, asset: asset, issuer: issuer, amount: amount, url:url }
          }
        })  
        if (this.payments)  {
          console.log('payments.push', this.payments.length)
          this.payments = this.payments.concat(records)
          console.log('payments.push1', this.payments.length)
        } else {
          this.payments = records
          console.log('payments.push2', this.payments.length)
        }
        if (pms.data._links.next.href){
          this.activityResult.paymentNextURL = pms.data._links.next.href
        }
        console.log('this.activityResult.paymentNextURL:', this.activityResult.paymentNextURL)
        this.activityResult.paymentEmptyResultTimes = 0              
      } else {
        this.activityResult.paymentEmptyResultTimes += 1
      }
    }).catch(e => {
      console.log(e)
    })
  }

  getNetworkHistory(){
    this.stellarService.getNetworkHistory(this.authService.userData.PublicKey, 5, null).then(ops => {
      console.log('getNetworkHistory:', ops.data)
      if (ops && ops.data._embedded.records.length > 0){
        var records: any[] = ops.data._embedded.records.filter(item => {
          if (item.type === 'create_account' || item.type === "change_trust" ){
            return item
          }
        }).map( item => {
          let time =  moment.utc(item.created_at).local().format('DD/MM/YYYY HH:mm:ss')
          let op = ''
          let amount = '-'
          let account = '-'
          let asset = 'XLM'
          let url = 'https://stellar.expert/explorer/public/search?term='+item.id
                    
          if (item.type === 'create_account'){
            op = 'Credited'                  
            amount = '+' + item.starting_balance
          } 
          if (item.type === "change_trust"){
            op = 'Trustline Created'   
            account = this.trimAddress(item.trustee)  
            asset = item.asset_code             
          }               
          return {time: time, op:op, id: item.id, amount: amount, account: account, asset: asset, url:url}
        })   
      }
      this.operations = records           
    })
  }

  trimAddress(pk){
    return pk.slice(0, 6) + '...' + pk.slice( pk.length-7, pk.length-1)
  }

  getAccountOrders(nextURL, countOpenOrder:boolean) {  
    console.log('start getAccountOrders:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
    this.stellarService.getOffer(this.authService.userData.PublicKey, 200, nextURL).then(pms => {          
      if (pms && pms.data._embedded.records.length > 0){   
        let totalOpenXLM = 0
        let totalOpenGRX = 0
        var records: any[] = pms.data._embedded.records.map((of, index) => {
          let type = 'BUY'
          let asset = 'GRX'
          
          if (of.buying.asset_type == 'native'){
            type = 'SELL'
            asset = of.selling.asset_code
          } else {
            asset = of.buying.asset_code
          }
          
          let time = moment.utc(of.last_modified_time).local().format('DD/MM/YYYY HH:mm:ss')

          let buying = this.parseAsset(of.buying);
          let selling = this.parseAsset(of.selling);
          var cachedOffer
          let offerData
          if (type == 'SELL'){
            let grxXlmP = of.price_r.n/of.price_r.d
            cachedOffer = StellarSdk.Operation.manageSellOffer({
              buying: buying,
              selling: selling,
              amount: '0',
              price: of.price_r,
              offerId: of.id         
            });
            if (countOpenOrder){
              totalOpenGRX = totalOpenGRX + +of.amount
            }
            offerData = {time: time, type:type, asset:asset, amount:of.amount, xlmp: grxXlmP, 
              totalxlm: of.amount*grxXlmP, priceusd: grxXlmP*this.xlmP, totalusd: of.amount*grxXlmP*this.xlmP, 
              cachedOffer: cachedOffer, index:index,  realAmount: +of.amount, assetType:'GRX',}
          } else {
            let grxXlmP = of.price_r.d/of.price_r.n
            cachedOffer = StellarSdk.Operation.manageBuyOffer({
              buying: buying,
              selling: selling,
              buyAmount: '0',
              price: of.price_r,
              offerId: of.id          
            });
            if (countOpenOrder){
              totalOpenXLM += +of.amount
            }
            offerData = {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
              totalxlm: of.amount, priceusd: grxXlmP*this.xlmP, totalusd: of.amount*this.xlmP, 
              cachedOffer: cachedOffer, index:index, realAmount: +of.amount, assetType:'XLM'}
          }    
          console.log('fillOrders- cachedOffer:', cachedOffer, of.id)  
          return offerData      
        })  
        if (countOpenOrder){
          this.authService.userMetaStore.OpenOrdersGRX = totalOpenGRX    
          this.authService.userMetaStore.OpenOrdersXLM = totalOpenXLM 
        }

        console.log('ACC-ACTIVITY-METASTORE:',this.authService.userMetaStore)
        
        this.stellarService.allOffers = records
        if (pms.data._links.next.href){
          this.activityResult.openOrderNextURL = pms.data._links.next.href
        }
        console.log('this.activityResult.paymentNextURL:', this.activityResult.paymentNextURL)
        this.activityResult.openOrderEmptyResultTimes = 0 
        this.authService.userMetaStore.OpenOrders = this.stellarService.allOffers.length
        this.authService.SetLocalUserData() 
      } else {
        this.activityResult.openOrderEmptyResultTimes += 1 
        this.authService.userMetaStore.OpenOrdersGRX = 0    
        this.authService.userMetaStore.OpenOrdersXLM = 0 
        this.authService.userMetaStore.OpenOrders = 0
      }
      //console.log('end getAccountOrders:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
    })
            
  }

  getAccountTrades(nextURL) {  
    console.log('start getAccountTrades:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))
    this.stellarService.getTrade(this.authService.userData.PublicKey, 20, nextURL).then(pms => {          
      if (pms && pms.data._embedded.records.length > 0){  
       
        let records =  pms.data._embedded.records.map((of, index) => {        
          let type = 'BUY'
          let asset = of.counter_asset_code
          
          if (of.base_account === this.authService.userData.PublicKey){
            if (of.base_is_seller === true){
              type = 'SELL'
            } else {             
              type = 'BUY'
            }            
          } else {
            if (of.base_is_seller === true){
              type = 'SELL'
            } else {
              type = 'BUY'
            }   
          }          
          
          let url = 'https://stellar.expert/explorer/public/'          
          url = url+'ledger/'+of.counter_offer_id
          
          let grxXlmP = of.price.d/of.price.n
          let time = moment.utc(of.ledger_close_time).local().format('DD/MM/YYYY HH:mm:ss')
          return {time: time, type:type, asset:asset, amount:of.counter_amount, filled:'100%', xlmp: grxXlmP, 
            totalxlm: of.base_amount, priceusd: grxXlmP*this.xlmP, totalusd: of.base_amount*this.xlmP, index:index, url:url}
        })  
        
        if (this.stellarService.trades){
          this.stellarService.trades = this.stellarService.trades.concat(records)
          this.activityResult.completedOrderEmptyResultTimes = 0 
        } else {
          this.stellarService.trades = records
        }      
        if (pms.data._links.next.href){
          this.activityResult.completedOrderNextURL = pms.data._links.next.href
        }  
      } else {
        this.activityResult.completedOrderEmptyResultTimes += 1
      }    
      console.log('end getAccountTrades:', moment(new Date()).format('DD.MM.YYYY HH:mm:ss.SSS'))    
    }) 
         
  }  
  
  //allOrders, transfers, networkHistory 
  onTabChange(id: string) {
    console.log('tab: ', id)
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
    this.activeTabId = id
    switch (id){
      case 'allOrders':
        this.stellarService.allOffers = null
        this.stellarService.trades = null
        this.getAccountOrders(null, true)
        this.getAccTrades()        
        break;
      case 'transfers':
        this.getAccPayments()
        //this.getAccountPayments(null)
        break;
      case 'networkHistory':
        this.getNetworkHistory()
        break;      
    }
  }

  copySuccess(account: string) {
    if (this.clipboardService.copyFromContent(account)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  ngOnDestroy(){
    this.subs.unsubscribe()
  }

}
