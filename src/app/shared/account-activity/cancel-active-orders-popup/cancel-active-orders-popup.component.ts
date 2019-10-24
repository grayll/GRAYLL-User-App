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

  constructor(
    public popupService: PopupService,
    private stellarService: StellarService,
    private authService: AuthService,
    private router: Router,
    private snotifyService: SnotifyService,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  cancelAllOrders(){
    if (!this.authService.hash){
      this.popupService.close();
      this.router.navigateByUrl('/login')
    }
    this.stellarService.decryptSecretKey(this.authService.hash, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      key => {
        if (key === 'Decryption failed!'){ 
          this.snotifyService.simple('Invalid key')         
        } else { 
          let keyStr  = this.stellarService.SecretBytesToString(key)
          
          let promises = []
          this.stellarService.allOffers.forEach(item => {
            promises.push(this.stellarService.cancelOffer(this.stellarService.userAccount, keyStr, item.cachedOffer))
          });

          Promise.all(promises).then(()=> {
            this.stellarService.allOffers.splice(0,this.stellarService.allOffers.length)
            this.popupService.close();
            }
          ).catch(e => {
            console.log('cancelAllOffer error:', e)
            this.snotifyService.simple('Some order could not be cancelled. Please try again later.')
          })
        }
      }  
    ) 
  }

}
