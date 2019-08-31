import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SharedService} from '../../../../shared/shared.service';
import {WithdrawModel} from '../withdraw.model';

@Component({
  selector: 'app-withdraw-success-popup',
  templateUrl: './withdraw-success-popup.component.html',
  styleUrls: ['./withdraw-success-popup.component.scss']
})
export class WithdrawSuccessPopupComponent implements OnInit {

  @ViewChild('content') modal;
  withdrawModel: WithdrawModel;

  constructor(
    public popupService: PopupService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.withdrawModel = this.sharedService.getWithdrawModel();
  }

}
