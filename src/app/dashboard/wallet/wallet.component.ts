import {Component} from '@angular/core';
import {faCircle, faWallet} from '@fortawesome/free-solid-svg-icons';
import { StellarService } from '../../authorization/services/stellar-service';
import { AuthService } from "../../shared/services/auth.service"
import {SnotifyService} from 'ng-snotify';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent {

  faWallet = faWallet;
  faCircle = faCircle;

  totalXLM: number;
  totalGRX: number;
  xlmBalance: number;
  grxBalance: number;
  walletValue: string;
  walletBalance: number;
  XLMValue: string;
  GRXValue: string;
  XLMUsdValue: string;
  GRXUsdValue: string;

  grxP: number
  xlmP: number = 1

  // totalXLM: number;
  // totalGRX: number;
  gryBalance: number;
  grzBalance: number;
  algoWalletValue: string;
  algoWalletBalance: number;
  gryValue: string;
  grzValue: string;
  gryUsdValue: string;
  grzUsdValue: string;

  constructor ( 
      private stellarService: StellarService,
      private authService: AuthService,
      private snotifyService: SnotifyService,
    ) 
  {
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
      console.log(grx, xlm)   
      this.xlmP = +xlm
      this.grxP = +grx
      this.stellarService.userAccount = account;   
      this.stellarService.getBlFromAcc(this.stellarService.userAccount, res => {
        this.fillWalletData(res)   
    })
    })  
  }
  
  fillWalletData(res){
    this.totalXLM = res.xlm;
    this.totalGRX = res.grx;
    this.xlmBalance =  this.totalXLM*this.xlmP
    this.grxBalance = this.totalGRX*this.grxP*this.xlmP    
    this.walletBalance = this.xlmBalance + this.grxBalance
    this.walletValue = `$ ${this.walletBalance.toFixed(2)}`
    this.GRXValue = '' + Math.round(this.grxBalance*100/this.walletBalance)
    this.XLMValue = '' + (100 - +this.GRXValue)
    this.XLMUsdValue = `$ ${this.xlmBalance.toFixed(2)}`
    this.GRXUsdValue = `$ ${this.grxBalance.toFixed(2)}`
    
    this.authService.userData.totalGRX = this.totalGRX
    this.authService.userData.totalXLM = this.totalXLM
    this.authService.userData.xlmPrice = this.xlmP
    this.authService.userData.grxPrice = this.grxP
    this.authService.SetLocalUserData()     
  }

}




