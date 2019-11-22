import {Component, OnDestroy} from '@angular/core';
import { StellarService } from '../../authorization/services/stellar-service';
import {SubSink} from 'subsink';

@Component({
  selector: 'app-header-boxes',
  templateUrl: './header-boxes.component.html',
  styleUrls: ['./header-boxes.component.css']
})
export class HeaderBoxesComponent  implements OnDestroy  {
  subs: SubSink
  xlmP: number
  grxP: number
  totalXLM: number
  totalGRX: number
  grxUsdValue: any

  constructor(
    private stellarService: StellarService,
  ) {
    console.log('HeaderBoxesComponent')
    this.subs = new SubSink()
    this.subs.add(this.stellarService.observePrices().subscribe(values => {      
      this.xlmP = values[0]
      this.grxP = values[1]
      this.totalXLM = values[2]
      this.totalGRX = values[3]      
      this.grxUsdValue = (this.totalGRX * this.grxP * this.xlmP).toFixed(2)
    }))
  }
  ngOnDestroy(){
    this.subs.unsubscribe()
  }
}
