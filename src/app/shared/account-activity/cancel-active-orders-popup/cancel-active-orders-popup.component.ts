import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
var StellarSdk = require('stellar-sdk')

import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-cancel-active-orders-popup',
  templateUrl: './cancel-active-orders-popup.component.html',
  styleUrls: ['./cancel-active-orders-popup.component.css']
})
export class CancelActiveOrdersPopupComponent implements OnInit {

  @ViewChild('content') modal;
  password: string
  isCachedPass: boolean = this.authService.hash? true:false
  constructor(
    public popupService: PopupService,
    private stellarService: StellarService,
    private authService: AuthService,
    private router: Router,
    private snotifyService: SnotifyService,
    private dataService: NoticeDataService,
    private loadingService: LoadingService,
  ) { 
    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  
  cancelAllOrdersTest(){
      
    this.loadingService.show()
    this.stellarService.cancelOfferForAll(this.authService.getSecretKey(), this.stellarService.allOffers).then(()=> {

      this.popupService.close();
      this.authService.userMetaStore.OpenOrders = 0            
      this.stellarService.allOffers.forEach(item => {            
        if (item.assetType === 'XLM'){              
          this.authService.userMetaStore.OpenOrdersXLM = +this.authService.userMetaStore.OpenOrdersXLM - item.realAmount
        } else {             
          this.authService.userMetaStore.OpenOrdersGRX = +this.authService.userMetaStore.OpenOrdersGRX - item.realAmount
        }             
      })
      this.authService.updateUserMeta(true)
      this.loadingService.hide()
      this.stellarService.allOffers = []
    }).catch(e => {
      console.log('cancelAllOffer error:', e)
      if (e.toString().includes('status code 400')){
        this.snotifyService.simple('Insufficient funds to cancel this order! Please add more funds to your account.')  
      } else {
        this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
      }     
      this.loadingService.hide()     
    })    
  }
  cancelAllOrders(){
      
    this.loadingService.show()
    let promises = []
    this.stellarService.allOffers.forEach(item => {
      promises.push(this.stellarService.cancelOfferForAll(this.authService.getSecretKey(), item.cachedOffer))          
    });

    Promise.all(promises).then(()=> {
      this.popupService.close();
      this.authService.userMetaStore.OpenOrders = 0      
      this.authService.userMetaStore.OpenOrdersGRX = 0   
      this.authService.userMetaStore.OpenOrdersXLM = 0   
      // this.stellarService.allOffers.forEach(item => {            
      //   if (item.assetType === 'XLM'){              
      //     this.authService.userMetaStore.OpenOrdersXLM = +this.authService.userMetaStore.OpenOrdersXLM - item.realAmount
      //   } else {             
      //     this.authService.userMetaStore.OpenOrdersGRX = +this.authService.userMetaStore.OpenOrdersGRX - item.realAmount
      //   }             
      // })
      this.authService.updateUserMeta(true)
      this.loadingService.hide()
      this.stellarService.allOffers = []
    }).catch(e => {
      console.log('cancelAllOffer error:', e)
      if (e.toString().includes('status code 400')){
        this.snotifyService.simple('Insufficient funds to cancel this order! Please add more funds to your account.')  
      } else {
        this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
      }     
      this.loadingService.hide()     
    })    
  }

}
