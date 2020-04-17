import { Component, OnInit } from '@angular/core';
import { SwUpdateNotifyService } from './sw-update-notify.service';

@Component({
  selector: 'app-sw-update-notifiy',
  templateUrl: './sw-update-notifiy.component.html',
  styleUrls: ['./sw-update-notifiy.component.css']
})
export class SwUpdateNotifiyComponent implements OnInit {

  get isNotify(){
    return this.swNotify.isNotify;
  }
  constructor(private swNotify: SwUpdateNotifyService) { }

  ngOnInit() {
  }

  refresh(){    
    setTimeout(()=> {
      this.swNotify.hide()
      window.location.reload()
    }, 4)    
  }

  close(){
    this.swNotify.hide();
  }
}
