import {Component} from '@angular/core';
import {faBell, faChartBar, faCommentAlt, faLock, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  // Font Awesome Icons
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faLock = faLock;

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

  constructor() {}

  tabChanged(newTabId: string) {
    this.activeTabId = newTabId;
  }
}
