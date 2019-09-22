import {Component, OnDestroy, OnInit} from '@angular/core';
import {faBell, faChartBar, faCommentAlt, faExclamationTriangle, faLock, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  // Font Awesome Icons
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faLock = faLock;
  faWarning = faExclamationTriangle;

  activeTabId = 'Profile';

  navigationSettingPages = [
    {
      name: 'Profile',
      icon: this.faUser,
      routerLink: '/settings/profile/'
    },
    {
      name: 'Notifications',
      icon: this.faBell,
      routerLink: '/settings/profile/notifications'
    },
    {
      name: 'Data',
      icon: this.faChartBar,
      routerLink: '/settings/profile/data'
    },
    {
      name: 'Wallet',
      icon: this.faWallet,
      routerLink: '/settings/profile/wallet'
    },
    {
      name: 'Security',
      icon: this.faLock,
      routerLink: '/settings/profile/security'
    }
  ];

  constructor(
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.changeBackgroundColor(true);
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }

  tabChanged(newTabId: string) {
    this.activeTabId = newTabId;
  }
}
