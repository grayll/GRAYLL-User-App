import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SharedService} from '../../../shared/shared.service';
import {AlgoPositionModel} from '../../algo-position.model';

@Component({
  selector: 'app-open-algo-position-error',
  templateUrl: './open-algo-position-error.component.html',
  styleUrls: ['./open-algo-position-error.component.scss']
})
export class OpenAlgoPositionErrorComponent implements OnInit {

  @ViewChild('content') modal;
  algoPosition: AlgoPositionModel;

  constructor(
    public popupService: PopupService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.algoPosition = this.sharedService.getOpenedAlgoPosition();
  }

}
