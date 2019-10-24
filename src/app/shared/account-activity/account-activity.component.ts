import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {faArrowAltCircleDown, faCopy, faInfoCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {SubSink} from 'subsink';
var StellarSdk = require('stellar-sdk')

import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import * as moment from 'moment';


@Component({
  selector: 'app-account-activity',
  templateUrl: './account-activity.component.html',
  styleUrls: ['./account-activity.component.scss']
})
export class AccountActivityComponent implements OnInit, OnDestroy {

  @Input() showMoreDetails: boolean;

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
  payments: any;
  operations: any;
  subs: SubSink
  account: any

  grxP:number
  xlmP:number

  // Font Awesome Icons
  faDownload = faArrowAltCircleDown;
  faClose = faTimesCircle;
  faInfo = faInfoCircle;
  faCopy = faCopy;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private stellarService: StellarService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.subs = new SubSink()
    this.selectedTab = this.activityTabs[0];
    this.subs.add(this.stellarService.observePrices().subscribe(prices => {
      this.grxP = prices[0]
      this.xlmP = prices[1]

      this.account = this.stellarService.userAccount
      this.account.offers().then( ofs => {  
        console.log('account.offers():', ofs)      
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

          let time = moment.utc(of.last_modified_time).local().format('DD/MM/YYYY HH:mm:ss')
          return {time: time, type:type, asset:asset, amount:of.amount, xlmp: of.price, 
            totalxlm: of.amount*of.price, grxp: this.grxP, totalgrx: of.amount*of.price*this.xlmP, cachedOffer: cachedOffer, index:index}
        })
        //console.log('offers: ', this.offers)
        this.offers = this.stellarService.allOffers 
      })
    }))    
    
  }

  cancelOffer(offer, index){
    if (!this.authService.hash){
      this.router.navigateByUrl('/login')
    }
    this.stellarService.decryptSecretKey(this.authService.hash, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      key => {
        if (key === 'Decryption failed!'){ 
          this.snotifyService.simple('Invalid key')         
        } else {         
          this.stellarService.cancelOffer(this.account, this.stellarService.SecretBytesToString(key), offer).then(res=>
            {               
              this.stellarService.allOffers.splice(index, 1)
            }

          ).catch(e => {
            console.log('cancelOffer error:', e)
            this.snotifyService.simple('Can not cancel offer now. Please try again later.')
          })
        }
      }  
    )  
  }

  parseAsset(asset) {
    if (asset.asset_type == 'native') {
      return StellarSdk.Asset.native();
    } else {
      return new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
    }
  }

  ngOnInit() {
  }
  //allOrders, transfers, networkHistory 
  onTabChange(id: string) {
    console.log('tab: ', id)
    this.selectedTab = this.activityTabs.find((t) => t.id === id);
    switch (id){
      case 'allOrders':
          break;
      case 'transfers':
        if (this.account){
          this.account.payments().then(payments => {
            console.log('payments:', payments.records)
            if (payments && payments.records.length > 0){
              this.payments = payments.records
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
              this.operations = ops.records
            }
          }).catch(e => {
            console.log(e)
          })

          this.account.transactions().then(trans => {
            console.log('trans:', trans.records)
            
          }).catch(e => {
            console.log(e)
          })

          this.account.trades().then(data => {
            console.log('trade:', data.records)
            
          }).catch(e => {
            console.log(e)
          })
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
