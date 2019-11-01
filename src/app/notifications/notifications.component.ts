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

  algoNotifications: AlgoNotificationModel[] = [];
  algoNotificationsToShow: AlgoNotificationModel[] = [];
  walletNotifications: any[] = [];
  walletNotificationsToShow: any[] = [];
  systemNotifications: GeneralNotificationModel[] = [];
  systemNotificationsToShow: GeneralNotificationModel[] = [];

  private walletNotificationsMobileScrollContainer: Element;
  private algoNotificationsMobileScrollContainer: Element;
  private generalNotificationsMobileScrollContainer: Element;

  readNoticeIds: string[] = []
  // Font Awesome Icons
  faWarning = faExclamationTriangle;
  faBell = faBell;
  faSearch = faSearch;

  constructor(
    public notificationsService: NotificationsService,
    public sharedService: SharedService,
    private authService:AuthService,
  ) {
    // Get notices from serve
    this.populateNotifications();

    axios.post(`${environment.api_url}api/v1/users/notices`, {},
    { headers: { 'Authorization': 'Bearer ' + this.authService.userData.token,}
    }).then(res => {
      console.log(res)
      let url = 'https://stellar.expert/explorer/public/'
      if (environment.horizon_url.includes('testnet')){
        url = 'https://stellar.expert/explorer/testnet/'
      }
      url = url + 'search?term='
      this.walletNotificationsToShow = res.data.notices.map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        item.url = url + item.txId 
        return item
      })
      this.walletNotifications = this.walletNotificationsToShow

    }).catch(e => {
      console.log(e)
    })
    this.populateNumberOfUnreadNotifications();
  }

  ngOnInit() {
    this.changeBackgroundColor(true);
    setTimeout(() => {
      this.loadMobileNotificationContainers();
    }, 100);
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
    axios.post(`${environment.api_url}api/v1/users/updateReadNotices`, {ids:this.readNoticeIds},
    { headers: { 'Authorization': 'Bearer ' + this.authService.userData.token,}
    }).then(res => {
      if (res.data.errCode == environment.SUCCESS){
        this.readNoticeIds = []
        console.log("Updated read notice ids")
      }
      console.log(res)
    }).catch(e => {
      console.log(e)
    })
  }

  private populateNotifications() {
    this.algoNotifications = [
      new AlgoNotificationModel(
        1,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        true,
        Date.now()
      ),
      new AlgoNotificationModel(
        18,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        false,
        Date.now()
      ),
      new AlgoNotificationModel(
        2,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        false,
        Date.now()
      ),
      new AlgoNotificationModel(
        10,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        true,
        Date.now()
      ),
      new AlgoNotificationModel(
        11,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        false,
        Date.now()
      ),
      new AlgoNotificationModel(
        12,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        10108181408618385411,
        true,
        Date.now()
      )
  ];
    this.algoNotificationsToShow = this.algoNotifications;
    
    this.systemNotifications = [
      new GeneralNotificationModel(
        5,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        false,
        Date.now()
      ),
      new GeneralNotificationModel(
        15,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        false,
        Date.now()
      ),
      new GeneralNotificationModel(
        17,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        false,
        Date.now()
      ),
      new GeneralNotificationModel(
        6,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        false,
        Date.now()
      ),
      new GeneralNotificationModel(
        7,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        true,
        Date.now()
      ),
      new GeneralNotificationModel(
        8,
        'GRZ | Arkady',
        '0.11% ROI Increase | 18.81% Total Position ROI',
        false,
        Date.now()
      )
    ];
    this.systemNotificationsToShow = this.systemNotifications;
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
    }
  }

  markWalletNotificationAsRead(notification: any) {
    if (!notification.isRead) {
      notification.isRead = true;

      // Save notice marked as read to list and update when component destroy
      this.readNoticeIds.push(notification.id)

      this.notificationsService.decreaseNumberOfAllUnreadNotifications();
      this.notificationsService.decreaseNumberOfUnreadWalletNotifications();
    }
  }

  markSystemNotificationAsRead(notification: GeneralNotificationModel) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.notificationsService.decreaseNumberOfAllUnreadNotifications();
      this.notificationsService.decreaseNumberOfUnreadSystemNotifications();
    }
  }

  swipeLeft() {
    this.carousel.next();
  }

  swipeRight() {
    this.carousel.prev();
  }

}
