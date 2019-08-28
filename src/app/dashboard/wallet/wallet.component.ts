import {Component} from '@angular/core';
import {faCircle, faWallet} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent {

  faWallet = faWallet;
  faCircle = faCircle;

  constructor() { }

}
