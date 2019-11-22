import {Component, OnDestroy} from '@angular/core';
import {faCircle, faWallet} from '@fortawesome/free-solid-svg-icons';
import { StellarService } from '../../authorization/services/stellar-service';
import { AuthService } from "../../shared/services/auth.service"
import {SnotifyService} from 'ng-snotify';
import {SubSink} from 'subsink';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnDestroy  {

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

  gryBalance: number;
  grzBalance: number;
  algoWalletValue: string;
  algoWalletBalance: number;
  gryValue: string;
  grzValue: string;
  gryUsdValue: string;
  grzUsdValue: string;
  subs: SubSink

  constructor ( 
      private stellarService: StellarService,
      private authService: AuthService,
      private snotifyService: SnotifyService,
    ) 
  {
    this.subs = new SubSink()
    this.subs.add(this.stellarService.observePrices().subscribe(values => {
      this.xlmP = values[0]
      this.grxP = values[1]
      this.totalXLM = values[2]
      this.totalGRX = values[3]
      this.fillWalletData()
    }))
   
  }
  
  fillWalletData(){    
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}




