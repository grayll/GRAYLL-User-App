import {Component, OnDestroy, OnInit, ViewChild, HostListener} from '@angular/core';
import {faBell, faExclamationTriangle, faSearch} from '@fortawesome/free-solid-svg-icons';
import {AlgoNotificationModel, GeneralNotificationModel, WalletNotificationModel, Notice, NoticeId} from './notification.model';
import {NotificationsService} from './notifications.service';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock';
import {SharedService} from '../shared/shared.service';
import {AuthService} from 'src/app/shared/services/auth.service';
import axios from 'axios';
import {environment} from 'src/environments/environment'
import * as moment from 'moment'
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoticeDataService} from './notifications.dataservice'



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
  pageId: string

  private noticeColl: AngularFirestoreCollection<Notice>;
  notices: Observable<NoticeId[]>;
  noticesAlgo: Observable<NoticeId[]>;
  noticesGeneral: Observable<NoticeId[]>;

  lastCursorWallet:number = 0
  lastCursorAlgo:number = 0
  lastCursorGeneral:number = 0

  walletPath:string
  algoPath:string
  generalPath:string
  limit:number

  constructor(
    public notificationsService: NotificationsService,
    public sharedService: SharedService,
    public authService: AuthService,
    private http: HttpClient,
    private afs: AngularFirestore,
    public dataService:NoticeDataService,
  ) {
    // Get notices from server
    this.pageId = "notification"
    this.limit = 200
    
    this.walletPath = 'notices/wallet/'+this.authService.userData.Uid
    this.algoPath = 'notices/algo/'+this.authService.userData.Uid
    this.generalPath = 'notices/general/'+this.authService.userData.Uid

    console.log(this.walletPath)
    this.dataService.first(this.walletPath, this.limit )
    this.notices = this.dataService.data

    this.dataService.firstAlgo(this.algoPath, this.limit )
    this.noticesAlgo = this.dataService.algoData

    this.dataService.firstGeneral(this.generalPath, this.limit)
    this.noticesGeneral = this.dataService.generalData

    // this.dataService.subsMarkRead().subscribe(async (value) => {
    //   console.log("received push MarkRead")
    //   await this.dataService.markAsRead(value.collPath, value.id)
    // })

    //this.populateNotifications(0, "all");
  }

  ngOnInit() {
    this.changeBackgroundColor(true);
    setTimeout(() => {
      this.loadMobileNotificationContainers();
    }, 100);

    if (!this.authService.userData){
      this.authService.GetLocalUserData()
    }
      
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
  // @HostListener('window:beforeunload')
  // async ngOnDestroy() {
  //   if (this.myUserSub) {
  //     this.myUserSub.unsubscribe();
  //   }
  //   await this.authService.logout();
  // }
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
    enableBodyScroll(this.algoNotificationsMobileScrollContainer);
    enableBodyScroll(this.walletNotificationsMobileScrollContainer);
    enableBodyScroll(this.generalNotificationsMobileScrollContainer);

    // Send read ids to server
    if (this.readWalletNoticeIds.length > 0 || this.readGeneralNoticeIds.length > 0 || this.readAlgoNoticeIds.length > 0){
      console.log('this.readWalletNoticeIds', this.readWalletNoticeIds)
      this.http.post(`api/v1/users/updateReadNotices`, 
      {walletIds:this.readWalletNoticeIds, algoIds:this.readAlgoNoticeIds, generalIds:this.readGeneralNoticeIds}).
      subscribe(res => {
        if ((res as any).errCode == environment.SUCCESS){         
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
  
  private populateNotifications(cursor:number, noticeType:string) {
    this.http.post(`api/v1/users/notices`, {limit:100, cursor:cursor, noticeType:noticeType})
    .subscribe(res => {      
      let url = 'https://stellar.expert/explorer/public/'
      if (environment.horizon_url.includes('testnet')){
        url = 'https://stellar.expert/explorer/testnet/'
      }
      url = url + 'search?term='
      this.walletNotificationsToShow = (res as any).wallets.map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        item.url = url + item.txId 
        return item
      })
      this.walletNotifications = this.walletNotificationsToShow

      this.systemNotifications = (res as any).generals.map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        //item.url = url + item.txId 
        return item
      })
      this.systemNotificationsToShow = this.systemNotifications

      this.algoNotifications = (res as any).algos.map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        item.url = url + item.txId 
        return item
      })
      this.algoNotificationsToShow = this.algoNotifications   
    },
    e => {
      console.log(e)
    })
  }

  // populateNumberOfUnreadNotifications() {
  //   this.notificationsService.resetNumberOfAllUnreadNotifications();
  //   const algoUnread = this.algoNotifications.filter((n) => !n.isRead).length;
  //   const walletUnread = this.walletNotifications.filter((n) => !n.isRead).length;
  //   const systemUnread = this.systemNotifications.filter((n) => !n.isRead).length;
  //   this.notificationsService.increaseNumberOfAllUnreadNotificationsBy(algoUnread + walletUnread + systemUnread);
  //   this.notificationsService.setNumberOfUnreadAlgoNotifications(algoUnread);
  //   this.notificationsService.setNumberOfUnreadWalletNotifications(walletUnread);
  //   this.notificationsService.setNumberOfUnreadSystemNotifications(systemUnread);
  // }

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

  markAsRead(collPath: string, notice:any) {
    //console.log('notice-com:markAsRead')
    if (!notice.isRead) {
      //console.log('notice-com:markAsRead not isread')
      notice.isRead = true;       
      if (collPath.includes('wallet')){
        if (this.authService.userMetaStore.UrWallet - 1 >= 0){
          this.authService.userMetaStore.UrWallet = this.authService.userMetaStore.UrWallet - 1
          //await this.dataService.markAsRead(this.walletPath, notice.id)
          //this.dataService.pushMarkRead({collPath:this.walletPath, id:notice.id})
        }
        this.readWalletNoticeIds.push(notice.id)
      } else if(collPath.includes('algo')){
        // need to check type of notice: gry1,2,3 gryz
        // if (this.authService.userMetaStore.UrAlgo - 1 >= 0){
        //   this.authService.userMetaStore.UrAlgo = this.authService.userMetaStore.UrAlgo - 1
        // }
        this.readAlgoNoticeIds.push(notice.id)
      } else if(collPath.includes('general')){
        if (this.authService.userMetaStore.UrGeneral - 1 >= 0){
          this.authService.userMetaStore.UrGeneral = this.authService.userMetaStore.UrGeneral - 1
        }
        this.readGeneralNoticeIds.push(notice.id)
      }      
    }
  }
  
  swipeLeft() {
    this.carousel.next();
  }

  swipeRight() {
    this.carousel.prev();
  }

}
