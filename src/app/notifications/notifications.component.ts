import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {faBell, faExclamationTriangle, faSearch} from '@fortawesome/free-solid-svg-icons';
import {AlgoNotificationModel, GeneralNotificationModel, WalletNotificationModel} from './notification.model';
import {NotificationsService} from './notifications.service';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';
import {SharedService} from '../shared/shared.service';
import {AuthService} from 'src/app/shared/services/auth.service';
import axios from 'axios';
import {environment} from 'src/environments/environment'
import * as moment from 'moment'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit, OnDestroy {

  @ViewChild(NgbCarousel) carousel;

  private isShowingAllAlgoNotifications = true;
  private isShowingAllWalletNotifications = true;
  private isShowingAllSystemNotifications = true;

  algoNotifications: any[] = [];
  algoNotificationsToShow: any[] = [];
  walletNotifications: any[] = [];
  walletNotificationsToShow: any[] = [];
  systemNotifications: any[] = [];
  systemNotificationsToShow: any[] = [];

  private walletNotificationsMobileScrollContainer: Element;
  private algoNotificationsMobileScrollContainer: Element;
  private generalNotificationsMobileScrollContainer: Element;

  readWalletNoticeIds: string[] = []
  readAlgoNoticeIds: string[] = []
  readGeneralNoticeIds: string[] = []
  // Font Awesome Icons
  faWarning = faExclamationTriangle;
  faBell = faBell;
  faSearch = faSearch;

  constructor(
    public notificationsService: NotificationsService,
    public sharedService: SharedService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    // Get notices from serve
    this.populateNotifications();
  }

  ngOnInit() {
    this.changeBackgroundColor(true);
    setTimeout(() => {
      this.loadMobileNotificationContainers();
    }, 100);

    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
  }
  
  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
    addClass ? body.classList.add('dark-navy-bg') : body.classList.remove('dark-navy-bg');
  }

  private loadMobileNotificationContainers() {
    const elements: NodeListOf<Element> = document.querySelectorAll('.scroll-cont');
    this.algoNotificationsMobileScrollContainer = elements[0];
    this.walletNotificationsMobileScrollContainer = elements[1];
    this.generalNotificationsMobileScrollContainer = elements[2];
    disableBodyScroll(this.algoNotificationsMobileScrollContainer);
    disableBodyScroll(this.walletNotificationsMobileScrollContainer);
    disableBodyScroll(this.generalNotificationsMobileScrollContainer);
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
    enableBodyScroll(this.algoNotificationsMobileScrollContainer);
    enableBodyScroll(this.walletNotificationsMobileScrollContainer);
    enableBodyScroll(this.generalNotificationsMobileScrollContainer);

    // Send read ids to server
    if (this.readWalletNoticeIds.length > 0 || this.readGeneralNoticeIds.length > 0 || this.readAlgoNoticeIds.length > 0){
      this.http.post(`api/v1/users/updateReadNotices`, 
      {walletIds:this.readWalletNoticeIds, algoIds:this.readAlgoNoticeIds, generalIds:this.readGeneralNoticeIds}).
      subscribe(res => {
        if ((res as any).errCode == environment.SUCCESS){
          this.readWalletNoticeIds = []
          this.readAlgoNoticeIds = []
          this.readGeneralNoticeIds = []
          console.log("Updated read notice ids")
        }        
      },
      e => {
        console.log(e)
      })
      // if (!this.authService.userData){
      //   this.authService.GetLocalUserData()
      // }       
    }
  }

  private populateNotifications() {
    this.http.post(`api/v1/users/notices`, {})
    .subscribe(res => {      
      let url = 'https://stellar.expert/explorer/public/'
      if (environment.horizon_url.includes('testnet')){
        url = 'https://stellar.expert/explorer/testnet/'
      }
      url = url + 'search?term='
      this.walletNotificationsToShow = (res as any).notices.filter(item => item.type =='wallet').map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        item.url = url + item.txId 
        return item
      })
      this.walletNotifications = this.walletNotificationsToShow

      this.systemNotifications = (res as any).notices.filter(item => item.type =='general').map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        //item.url = url + item.txId 
        return item
      })
      this.systemNotificationsToShow = this.systemNotifications

      this.algoNotifications = (res as any).notices.filter(item => item.type =='algo').map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        item.url = url + item.txId 
        return item
      })
      this.algoNotificationsToShow = this.algoNotifications

      this.populateNumberOfUnreadNotifications();

    },
    e => {
      console.log(e)
    })
  }

  populateNumberOfUnreadNotifications() {
    this.notificationsService.resetNumberOfAllUnreadNotifications();
    const algoUnread = this.algoNotifications.filter((n) => !n.isRead).length;
    const walletUnread = this.walletNotifications.filter((n) => !n.isRead).length;
    const systemUnread = this.systemNotifications.filter((n) => !n.isRead).length;
    this.notificationsService.increaseNumberOfAllUnreadNotificationsBy(algoUnread + walletUnread + systemUnread);
    this.notificationsService.setNumberOfUnreadAlgoNotifications(algoUnread);
    this.notificationsService.setNumberOfUnreadWalletNotifications(walletUnread);
    this.notificationsService.setNumberOfUnreadSystemNotifications(systemUnread);
  }

  filterReadAlgoNotifications() {
    if (this.isShowingAllAlgoNotifications) {
      this.algoNotificationsToShow = this.algoNotifications.filter((n) => !n.isRead);
    } else {
      this.algoNotificationsToShow = this.algoNotifications;
    }
    this.isShowingAllAlgoNotifications = !this.isShowingAllAlgoNotifications;
  }

  filterReadWalletNotifications() {
    if (this.isShowingAllWalletNotifications) {
      this.walletNotificationsToShow = this.walletNotifications.filter((n) => !n.isRead);
    } else {
      this.walletNotificationsToShow = this.walletNotifications;
    }
    this.isShowingAllWalletNotifications = !this.isShowingAllWalletNotifications;
  }

  filterReadSystemNotifications() {
    if (this.isShowingAllSystemNotifications) {
      this.systemNotificationsToShow = this.systemNotifications.filter((n) => !n.isRead);
    } else {
      this.systemNotificationsToShow = this.systemNotifications;
    }
    this.isShowingAllSystemNotifications = !this.isShowingAllSystemNotifications;
  }

  markAlgoNotificationAsRead(notification: AlgoNotificationModel) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.notificationsService.decreaseNumberOfAllUnreadNotifications();
      this.notificationsService.decreaseNumberOfUnreadAlgoNotifications();
      this.notificationsService.publicNumberNotices([0,-1,0])
    }
  }

  markWalletNotificationAsRead(notification: any) {
    if (!notification.isRead) {
      notification.isRead = true;

      // Save notice marked as read to list and update when component destroy
      this.readWalletNoticeIds.push(notification.id)
      this.notificationsService.decreaseNumberOfAllUnreadNotifications();
      this.notificationsService.decreaseNumberOfUnreadWalletNotifications();
      this.notificationsService.publicNumberNotices([-1,0,0])
    }
  }

  markSystemNotificationAsRead(notification: any) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.readGeneralNoticeIds.push(notification.id)
      this.notificationsService.decreaseNumberOfAllUnreadNotifications();
      this.notificationsService.decreaseNumberOfUnreadSystemNotifications();
      this.notificationsService.publicNumberNotices([0,0,-1])
    }
  }

  swipeLeft() {
    this.carousel.next();
  }

  swipeRight() {
    this.carousel.prev();
  }

}
