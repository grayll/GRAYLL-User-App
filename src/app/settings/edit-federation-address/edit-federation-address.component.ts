import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';

@Component({
  selector: 'app-edit-federation-address',
  templateUrl: './edit-federation-address.component.html',
  styleUrls: ['./edit-federation-address.component.css']
})
export class EditFederationAddressComponent implements OnInit {

  @ViewChild('content') modal;

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  save() {
    this.popupService.close().then(() => {
      this.snotifyService.simple('Federation address saved.');
    });
  }

}
