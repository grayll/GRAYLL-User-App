import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faChevronCircleUp, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import {WalletNotificationModel} from '../../notifications/notification.model';

@Component({
  selector: 'app-wallet-notification-item',
  templateUrl: './wallet-notification-item.component.html',
  styleUrls: ['./wallet-notification-item.component.css']
})
export class WalletNotificationItemComponent implements OnInit {

  @Input() notification: WalletNotificationModel;
  @Input() isInPopup: boolean;
  @Output() routeTo = new EventEmitter<string>();
  @Output() markAsRead = new EventEmitter<WalletNotificationModel>();
  isContentCollapsed = true;
  isMarkedAsRead = false;

  faPlus = faPlusCircle;
  faMinus = faChevronCircleUp;
  faExpand: any;

  constructor(
    private router: Router
  ) {
    this.faExpand = this.faPlus;
  }

  ngOnInit() {}

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
