import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AlgoNotificationModel} from '../../notifications/notification.model';
import {faChevronCircleUp, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import * as moment from 'moment'
import {DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-algo-notification-item',
  templateUrl: './algo-notification-item.component.html',
  styleUrls: ['./algo-notification-item.component.css']
})
export class AlgoNotificationItemComponent implements OnInit {

  @Input() notification: any;
  @Input() isInPopup: boolean;
  @Output() routeTo = new EventEmitter<string>();
  @Output() markAsRead = new EventEmitter<any>();
  isContentCollapsed = true;
  isMarkedAsRead = false;

  faPlus = faPlusCircle;
  faMinus = faChevronCircleUp;
  faExpand: any;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.faExpand = this.faPlus;
  }

  ngOnInit() {
    
  }

  expandNotification() {
    this.markNotificationAsRead();
    this.isContentCollapsed = !this.isContentCollapsed;
    this.faExpand = this.isContentCollapsed ? this.faPlus : this.faMinus;
  }

  private markNotificationAsRead() {
    if (this.isContentCollapsed && !this.isMarkedAsRead) {
      this.isMarkedAsRead = true;
      this.markAsRead.emit(this.notification);
    }
  }

  goTo(link: string) {
    if (this.isInPopup) {
      this.routeTo.emit(link);
    } else {
      this.router.navigate([link]);
    }
  }

}
