import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {Router} from '@angular/router';
import {SharedService} from '../../../shared/shared.service';
import {AlgoPositionModel} from '../../algo-position.model';

@Component({
  selector: 'app-open-algo-position-success',
  templateUrl: './open-algo-position-success.component.html',
  styleUrls: ['./open-algo-position-success.component.scss']
})
export class OpenAlgoPositionSuccessComponent implements OnInit {

  @ViewChild('content') modal;
  algoPosition: AlgoPositionModel;

  constructor(
    public popupService: PopupService,
    private router: Router,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.algoPosition = this.sharedService.getOpenedAlgoPosition();
  }

  goToError() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
      }, 1000);
    });
  }

  goToOverview() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/system/overview']);
        this.scrollToSystemActivity();
      }, 200);
    });
  }

  scrollToSystemActivity() {
    const el = document.getElementById('systemActivityTable');
    el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

}
