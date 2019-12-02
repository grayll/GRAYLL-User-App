import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {faArrowAltCircleDown, faCopy, faInfoCircle, faSearch, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {SubSink} from 'subsink';
var StellarSdk = require('stellar-sdk')
//import {OrderModel} from './models/order.model';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SharedService } from 'src/app/shared/shared.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
// import {TransfersModel} from './models/transfers.model';
// import {NetworkHistoryModel} from './models/network-history.model';
// import { deflate } from 'zlib';

@Component({
  selector: 'app-account-activity',
  templateUrl: './account-activity.component.html',
  styleUrls: ['./account-activity.component.scss']
})
export class AccountActivityComponent implements OnInit, OnDestroy {

  @Input() showMoreDetails: boolean;
  @Input() activeTabId: string;
  @Input() showAllCompletedOrders: boolean;
  @Input() scrollToCompletedOrders: boolean;

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
  payments: any;
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

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private stellarService: StellarService,
    private authService: AuthService,
    private router: Router,
    private sharedService:SharedService,
  ) {
    console.log('constructor-account activity')
    this.subs = new SubSink()
    this.selectedTab = this.activityTabs[0];

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
      this.stellarService.userAccount = account;
      this.stellarService.publishPrices([+grx,+xlm])     
   // })
     
   // this.subs.add(this.stellarService.observePrices().subscribe(prices => {
      this.grxP = +grx
      this.xlmP = +xlm
      //console.log('acc-activity received Prices:', prices)
      this.account = this.stellarService.userAccount
      Promise.all([
        this.account.offers(),
        this.account.trades(),
      ]).then(([ofs, trades]) => {
        this.fillOrders(ofs)
        this.fillTrades(trades)
      }).catch( err => {

      })                
    })
  }

  fillOrders(ofs) {  
    console.log('offer:', ofs) 
    if (ofs && ofs.records){
      this.authService.userData.OpenOrders = ofs.records.length
      this.authService.SetLocalUserData()
    }
    let totalOpenXLM = 0
    let totalOpenGRX = 0
    this.stellarService.allOffers = ofs.records.map((of, index) => {
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
        totalOpenGRX = totalOpenGRX + +of.amount
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
        
        totalOpenXLM += +of.amount
        offerData = {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
          totalxlm: of.amount, priceusd: grxXlmP*this.xlmP, totalusd: of.amount*this.xlmP, 
          cachedOffer: cachedOffer, index:index, realAmount: +of.amount, assetType:'XLM'}
      }    
      console.log('fillOrders- cachedOffer:', cachedOffer, of.id)  
      return offerData      
    })  
    this.authService.userData.OpenOrdersGRX = totalOpenGRX    
    this.authService.userData.OpenOrdersXLM = totalOpenXLM 
    this.offers = this.stellarService.allOffers  
    console.log('acc-activity:', this.authService.userData) 
    this.authService.SetLocalUserData() 
  }

  fillTrades(ofs) {  
    console.log('account.trades():', ofs)      
    this.trades = ofs.records.map((of, index) => {
      let type = 'BUY'
      let asset = of.counter_asset_code

      if (of.counter_asset_code == environment.ASSET){

      }

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
      if (environment.horizon_url.includes('testnet')){
        url = 'https://stellar.expert/explorer/testnet/'
      }
      url = url+'ledger/'+of.counter_offer_id
      console.log('of.counter_offer_id:', of.counter_offer_id)
      console.log('of.base_offer_id:', of.base_offer_id)
      let grxXlmP = of.price.d/of.price.n
      let time = moment.utc(of.ledger_close_time).local().format('DD/MM/YYYY HH:mm:ss')
      return {time: time, type:type, asset:asset, amount:of.counter_amount, filled:'100%', xlmp: grxXlmP, 
        totalxlm: of.base_amount, priceusd: grxXlmP*this.xlmP, totalusd: of.base_amount*this.xlmP, index:index, url:url}
        
       // let time = moment.utc(of.last_modified_time).local().format('DD/MM/YYYY HH:mm:ss')
      // return {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
      //   totalxlm: of.amount, priceusd: grxXlmP*this.xlmP, totalusd: of.amount*this.xlmP, cachedOffer: cachedOffer, index:index}

    })          
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
        fields = ['time','type','asset','amount', 'filled','xlmp','totalxlm','priceusd', 'totalusd', 'url']
        fileName = "OrderHistory.PDF"
        data = this.offers            
        break
      case "transfer":
        columns = ['Date',	'Counterparty',	'Asset', 'Issuer',	'Amount', 'Url']
        fields = ['time','counter','asset', 'issuer', 'amount', 'url']
        fileName = "TransferHistory.PDF"
        data = this.payments          
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

  // cancelOffer(offer, index, realAmount, assetType){
  //   if (!this.authService.hash){
  //     this.router.navigateByUrl('/login')
  //   }  
  //   console.log('cancelOffer-offer:', offer)     
  //   this.authService.GetSecretKey(null).then(SecKey => {      
  //     this.stellarService.cancelOffer(this.account, SecKey, offer, this.authService.userData, realAmount, assetType).then(res=>
  //       {               
  //         this.stellarService.allOffers.splice(index, 1)
  //         if (this.authService.userData.OpenOrders){
  //           this.authService.userData.OpenOrders -=1
  //         } else {
  //           this.authService.userData.OpenOrders = 0
  //         }
  //         if (this.authService.userData.OpenOrders < 0){
  //           this.authService.userData.OpenOrders = 0
  //         }
  //         this.authService.SetLocalUserData()    
  //       }
  //     ).catch(e => {
  //       console.log('cancelOffer error:', e)
  //       this.snotifyService.simple(`Currently the order can't be cancelled. Please try again later!`)
  //     })
  //   })  
  // }
  validateSession(){
    if (this.authService.isTokenExpired()){
      this.snotifyService.simple('The working session is expired. Please login again!'); 
      this.router.navigateByUrl('/login')
      return false
    } 
    if (!this.authService.hash){
      this.router.navigate(['/wallet/overview', {outlets: {popup: 'input-password'}}]);
      return false
    }
    return true
  }

  cancelOffer(item){
    if(!this.validateSession()){
      return
    }
    console.log('cancelOffer-cachedOffer:', item.cachedOffer)     
    this.authService.GetSecretKey(null).then(SecKey => {      
      this.stellarService.cancelOffer(this.account, SecKey, item.cachedOffer, this.authService.userData, item.realAmount, item.assetType).then(res=>
        {               
          this.stellarService.allOffers.splice(item.index, 1)
          if (this.authService.userData.OpenOrders){
            this.authService.userData.OpenOrders -=1
          } else {
            this.authService.userData.OpenOrders = 0
          }
          if (this.authService.userData.OpenOrders < 0){
            this.authService.userData.OpenOrders = 0
          }
          this.authService.SetLocalUserData()    
        }
      ).catch(e => {
        console.log('cancelOffer error:', e)
        this.snotifyService.simple(`Currently the order can't be cancelled. Please try again later!`)
      })
    })  
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
          const el = document.getElementById('completedOrdersContainer');
          el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }, 500);
      }
    }
  }
  ngOnInit() {
	  this.setActiveTab();
  }
  onScrollOpenOrders() {
    //this.populateOpenOrders();
  }
  
  onScrollCompletedOrders() {
    //this.populateCompletedOrders();
  }
  
  onScrollNetworkHistory() {
    //this.populateNetworkHistory();
  }
  
  onScrollTransfers() {
    //this.populateTransfers();
  }
  
  //allOrders, transfers, networkHistory 
  onTabChange(id: string) {
    console.log('tab: ', id)
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
    switch (id){
      case 'allOrders':
        this.account.offers().then( ofs => {  
          //console.log('account.offers():', ofs)      
          this.stellarService.allOffers = ofs.records.map((of, index) => {
            let type = 'BUY'
            let asset = 'GRX'
            
            if (of.buying.asset_type == 'native'){
              type = 'SELL'
              asset = of.selling.asset_code
            } else {
              asset = of.buying.asset_code
            }
            let buying = this.parseAsset(of.buying);
            let selling = this.parseAsset(of.selling);
            let cachedOffer
            if (type == 'SELL'){
              cachedOffer = StellarSdk.Operation.manageSellOffer({
                buying: buying,
                selling: selling,
                amount: '0',
                price: of.price_r,
                offerId: of.id,
              });
            } else {
              cachedOffer = StellarSdk.Operation.manageBuyOffer({
                buying: buying,
                selling: selling,
                buyAmount: '0',
                price: of.price_r,
                offerId: of.id,
              });
            }
            //console.log('offer:', of)
            let grxXlmP = of.price_r.d/of.price_r.n
            let time = moment.utc(of.last_modified_time).local().format('DD/MM/YYYY HH:mm:ss')
            return {time: time, type:type, asset:asset, amount:of.amount/grxXlmP, xlmp: grxXlmP, 
              totalxlm: of.amount, priceusd: grxXlmP*this.xlmP, totalusd: of.amount*this.xlmP, 
              cachedOffer: cachedOffer, index:index}             
          })       
          this.offers = this.stellarService.allOffers          
        })
        break;
      case 'transfers':
        if (this.account){
          this.account.payments().then(pms => {
            //console.log('payments:', pms.records)
            if (pms && pms.records.length > 0){
              this.payments = pms.records.filter(item => {
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
                  let url = 'https://stellar.expert/explorer/public/'
                  if (environment.horizon_url.includes('testnet')){
                    url = 'https://stellar.expert/explorer/testnet/'
                  }
                  url = url + 'search?term='+item.id 
                  return {time:time, counter:counter, asset: asset, issuer: issuer, amount: amount, url:url }
                }
              })    
              //this.transfers = this.payments.length          
            }
          }).catch(e => {
            console.log(e)
          })
        }
        break;
      case 'networkHistory':
        if (this.account){
          this.account.operations().then(ops => {
            console.log('op:', ops.records)
            if (ops && ops.records.length > 0){
              this.operations = ops.records.filter(item => {
                if (item.type === 'create_account' || item.type === "change_trust" ){
                  return item
                }
              }).map( item => {
                let time =  moment.utc(item.created_at).local().format('DD/MM/YYYY HH:mm:ss')
                let op = ''
                let amount = '-'
                let account = '-'
                let asset = 'XLM'
                let url = 'https://stellar.expert/explorer/public/'
                if (environment.horizon_url.includes('testnet')){
                  url = 'https://stellar.expert/explorer/testnet/'
                }
                url = url + 'search?term='+item.id
                if (item.type === 'create_account'){
                  op = 'Credited'                  
                  amount = '+' + item.starting_balance
                } 
                if (item.type === "change_trust"){
                  op = 'Trustline Created'   
                  account = item.trustee  
                  asset = item.asset_code             
                }               
                return {time: time, op:op, id: item.id, amount: amount, account: account, asset: asset, url:url}
              })              
            }
          }).catch(e => {
            console.log(e)
          })

          // this.account.transactions().then(trans => {
          //   console.log('trans:', trans.records)
            
          // }).catch(e => {
          //   console.log(e)
          // })

          // this.account.trades().then(data => {
          //   console.log('trade:', data.records)
            
          // }).catch(e => {
          //   console.log(e)
          // })
        }
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
