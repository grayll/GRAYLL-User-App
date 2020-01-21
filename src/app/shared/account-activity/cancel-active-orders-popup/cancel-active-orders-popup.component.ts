import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
var StellarSdk = require('stellar-sdk')

import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';

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
  ) { 
    // if (!this.authService.hash){
    //   this.isCachedPass = false
    // }
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  async cancelAllOrders(){
    let cachedOffers = this.stellarService.allOffers.map(item => item.cachedOffer)
    
      try {   
        let xdr = await this.stellarService.getCancelOfferXdrs(this.authService.userInfo.PublicKey, cachedOffers)

        this.authService.makeTransaction(xdr, "cancel").subscribe(res => {
          console.log(res)
          if ((res as any).errCode == "tx_success"){            
            this.authService.userMetaStore.OpenOrders = 0            
            this.stellarService.allOffers.forEach(item => {
              if (item.assetType === 'GRX'){
                this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX + item.realAmount
              } else if (item.assetType === 'XLM'){
                this.authService.userMetaStore.XLM = +this.authService.userMetaStore.XLM + item.realAmount
              }
            })
            this.stellarService.allOffers = []
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

      setTimeout(() => {
        this.popupService.close()
      }, 500);
    
  }
  cancelAllOrders1(){
    let pwd = this.authService.hash
    if (!this.authService.hash){
      pwd = this.password
    } 
    this.authService.GetSecretKey(pwd).then(SecKey => {   
      if (SecKey != ''){
        this.authService.hash = this.password
        let promises = []
        this.stellarService.allOffers.forEach(item => {
          promises.push(this.stellarService.cancelOffer(SecKey, item.cachedOffer, this.authService.userData, item.realAmount, item.assetType))
        });

        Promise.all(promises).then(()=> {
          this.stellarService.allOffers.splice(0, this.stellarService.allOffers.length)
          this.popupService.close();
          this.authService.userData.OpenOrders = 0
          this.authService.SetLocalUserData()
          }
        ).catch(e => {
          console.log('cancelAllOffer error:', e)
          if (e.toString().includes('status code 400')){
            this.snotifyService.simple('Insufficient funds to cancel this order! Please add more funds to your account.')  
          } else {
            this.snotifyService.simple(`The order could not be cancelled! Please retry.`)
          }          
        }) 
      } else {
        this.snotifyService.simple('Please enter a valid password!')
      }            
    }).catch( err => {
      this.snotifyService.simple('Please enter a valid password!')
    })
  }

}
