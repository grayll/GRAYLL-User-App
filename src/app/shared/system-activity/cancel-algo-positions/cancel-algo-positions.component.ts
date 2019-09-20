import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';

@Component({
  selector: 'app-cancel-algo-positions',
  templateUrl: './cancel-algo-positions.component.html',
  styleUrls: ['./cancel-algo-positions.component.css']
})
export class CancelAlgoPositionsComponent implements OnInit {
  
  @ViewChild('content') modal;
  
  constructor(
    public popupService: PopupService
  ) { }
  
  ngOnInit() {
    this.popupService.open(this.modal);
  }

}
