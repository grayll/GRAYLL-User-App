import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
import { AlgoService } from 'src/app/system/algo.service';

@Component({
  selector: 'app-cancel-algo-positions',
  templateUrl: './cancel-algo-positions.component.html',
  styleUrls: ['./cancel-algo-positions.component.css']
})
export class CancelAlgoPositionsComponent implements OnInit {
  
  @ViewChild('content') modal;
  
  constructor(
    public popupService: PopupService,
    public algoService: AlgoService,
  ) { }
  
  ngOnInit() {
    this.popupService.open(this.modal);
  }

  closeAll(){

  }

}
