import {Component, OnDestroy} from '@angular/core';
import { StellarService } from '../../authorization/services/stellar-service';
import {SubSink} from 'subsink';
import { AuthService } from "../../shared/services/auth.service"

@Component({
  selector: 'app-header-boxes',
  templateUrl: './header-boxes.component.html',
  styleUrls: ['./header-boxes.component.css']
})
export class HeaderBoxesComponent  implements OnDestroy  {
  
  constructor(
    private stellarService: StellarService,
    private authService: AuthService,
  ) {
    
  }
  ngOnDestroy(){
    //this.subs.unsubscribe()
  }
}
