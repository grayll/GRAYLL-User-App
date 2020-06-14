import {Component, OnDestroy} from '@angular/core';
import {faCircle, faWallet} from '@fortawesome/free-solid-svg-icons';
import { StellarService } from '../../authorization/services/stellar-service';
import { AuthService } from "../../shared/services/auth.service"
import {SnotifyService} from 'ng-snotify';
import {SubSink} from 'subsink';
import { AlgoService } from 'src/app/system/algo.service';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnDestroy  {

  faWallet = faWallet;
  faCircle = faCircle;

  constructor (       
    public authService: AuthService,      
  ) 
  {
       
  }
  
  
  ngOnDestroy(): void {
    //this.subs.unsubscribe();
  }
}




