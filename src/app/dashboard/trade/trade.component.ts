import {Component} from '@angular/core';
import {faChartLine, faCircle} from '@fortawesome/free-solid-svg-icons';
import { AlgoService } from 'src/app/system/algo.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent {

  faChartLine = faChartLine;
  faCircle = faCircle;

  constructor(private algoService:AlgoService,
    private authService:AuthService) { }

}
