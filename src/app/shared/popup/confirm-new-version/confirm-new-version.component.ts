import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import {ErrorService} from '../../error/error.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import {AuthService} from 'src/app/shared/services/auth.service';

@Component({
  selector: 'confirm-new-version',
  templateUrl: './confirm-new-version.component.html',
  styleUrls: ['./confirm-new-version.component.css']
})
export class ConfirmNewVersionComponent implements OnInit {

  @ViewChild('content') modal;
 
  password: string = '';
  twoFaCode: string = ''
 
  constructor(
    public popupService: PopupService,    
     
  ) {
    // check tfa status
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }
  
  submit() {
    this.popupService.close().then(() => {
      window.location.reload();
    });
  }  

}
