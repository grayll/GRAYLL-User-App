import {Component} from '@angular/core';
import {faChartLine, faCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent {

  faChartLine = faChartLine;
  faCircle = faCircle;

  constructor() { }

}
