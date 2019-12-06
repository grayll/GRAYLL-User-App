import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-xlm-balance-status-popup',
  templateUrl: './xlm-balance-status-popup.component.html',
  styleUrls: ['./xlm-balance-status-popup.component.css']
})
export class XlmBalanceStatusPopupComponent implements OnInit {

  @ViewChild('content') modal;
  openOrderReserved: number

  constructor(
    public popupService: PopupService,
    public authService: AuthService,
  ) { 
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

}
