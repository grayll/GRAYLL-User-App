import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
var StellarSdk = require('stellar-sdk')

import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import {SnotifyService} from 'ng-snotify';

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
  ) { 
    // if (!this.authService.hash){
    //   this.isCachedPass = false
    // }
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  cancelAllOrders(){
    let pwd = this.authService.hash
    if (!this.authService.hash){
      pwd = this.password
    } 
    this.authService.GetSecretKey(pwd).then(SecKey => {   
      if (SecKey != ''){
        this.authService.hash = this.password
        let promises = []
        this.stellarService.allOffers.forEach(item => {
          promises.push(this.stellarService.cancelOffer(this.stellarService.userAccount, 
            SecKey, item.cachedOffer, this.authService.userData, item.realAmount, item.assetType))
        });

        Promise.all(promises).then(()=> {
          this.stellarService.allOffers.splice(0, this.stellarService.allOffers.length)
          this.popupService.close();
          this.authService.userData.OpenOrders = 0
          this.authService.SetLocalUserData()
          }
        ).catch(e => {
          console.log('cancelAllOffer error:', e)
          this.snotifyService.simple('Some order could not be cancelled. Please try again later!')
        }) 
      } else {
        this.snotifyService.simple('Please enter the valid password')
      }            
    }).catch( err => {
      this.snotifyService.simple('Please enter the valid password')
    })
  }

}
