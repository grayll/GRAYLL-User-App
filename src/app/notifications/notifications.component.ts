import {Component, OnDestroy, OnInit, ViewChild, HostListener} from '@angular/core';
import {faBell, faExclamationTriangle, faSearch, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingService } from '../shared/services/loading.service';


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
  faCheckCircle = faCheckCircle;
  faSearch = faSearch;
  pageId: string
  notifiType: any = '';
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
    private loadingService: LoadingService,
    private afs: AngularFirestore,
    public dataService:NoticeDataService,
    public modalService: NgbModal,
  ) {
    // Get notices from server
    this.pageId = "notification"
    this.limit = 200
    
    this.walletPath = 'notices/wallet/'+this.authService.userData.Uid
    this.algoPath = 'notices/algo/'+this.authService.userData.Uid
    this.generalPath = 'notices/general/'+this.authService.userData.Uid

  
    this.dataService.first(this.walletPath, this.limit )
    this.notices = this.dataService.data

    this.dataService.firstAlgo(this.algoPath, this.limit )
    this.noticesAlgo = this.dataService.algoData

    this.dataService.firstGeneral(this.generalPath, this.limit)
    this.noticesGeneral = this.dataService.generalData

   
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
      //console.log('this.readAlgoNoticeIds', this.readAlgoNoticeIds)
      this.http.post(`api/v1/users/updateReadNotices`, {walletIds:this.readWalletNoticeIds, algoIds:this.readAlgoNoticeIds, 
        generalIds:this.readGeneralNoticeIds, 
        urgrz:this.authService.userMetaStore.UrGRZ, urgry1:this.authService.userMetaStore.UrGRY1,
        urgry2:this.authService.userMetaStore.UrGRY2, urgry3:this.authService.userMetaStore.UrGRY3}).
      subscribe(res => {
              
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
      let url = 'https://stellar.expert/explorer/public/search?term='
      this.walletNotificationsToShow = (res as any).wallets.map(item => {        
        item.url = url + item.txId 
        return item
      })
      this.walletNotifications = this.walletNotificationsToShow

      this.systemNotifications = (res as any).generals.map(item => {        
        return item
      })
      this.systemNotificationsToShow = this.systemNotifications

      this.algoNotifications = (res as any).algos.map(item => {
        let time = moment(item.time*1000).format('HH:mm | DD/MM/YYYY')
        item.time = time
        //item.url = url + item.txId 
        return item
      })
      this.algoNotificationsToShow = this.algoNotifications   
    },
    e => {
      console.log(e)
    })
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

  markAsRead(collPath: string, notice:any) {
    //console.log('notice-com:markAsRead')
    if (!notice.isRead) {
      
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
        if (!notice.type || notice.type.includes('GRZ')){
          if (this.authService.userMetaStore.UrGRZ - 1 >= 0){
            this.authService.userMetaStore.UrGRZ = this.authService.userMetaStore.UrGRZ - 1
          }
        } else if (notice.type.includes('GRY 1')){
          if (this.authService.userMetaStore.UrGRY1 - 1 >= 0){
            this.authService.userMetaStore.UrGRY1 = this.authService.userMetaStore.UrGRY1 - 1
          }
        } else if(notice.type.includes('GRY 2')){
          if (this.authService.userMetaStore.UrGRY2 - 1 >= 0){
            this.authService.userMetaStore.UrGRY2 = this.authService.userMetaStore.UrGRY2 - 1
          }
        } else if(notice.type.includes('GRY 3')){
          if (this.authService.userMetaStore.UrGRY3 - 1 >= 0){
            this.authService.userMetaStore.UrGRY3 = this.authService.userMetaStore.UrGRY3 - 1
          }
        }        
        this.readAlgoNoticeIds.push(notice.id)
      } else if(collPath.includes('general')){
        if (this.authService.userMetaStore.UrGeneral - 1 >= 0){
          this.authService.userMetaStore.UrGeneral = this.authService.userMetaStore.UrGeneral - 1
        }
        this.readGeneralNoticeIds.push(notice.id)
      }      
    }
  }

  markAllAsRead(confirmModal:any) {
    this.loadingService.show()
    this.http.post('api/v1/users/updateAllAsRead/'+this.notifiType, {}).subscribe(res => {
      //console.log(res)
      this.loadingService.hide()
      this.modalService.dismissAll()
      if ((res as any).errCode != environment.SUCCESS){               
        
      } else {
       
      }      
    },
    e => {      
      this.loadingService.hide()
      this.modalService.dismissAll()
    })  
  }
  
  swipeLeft() {
    this.carousel.next();
  }

  swipeRight() {
    this.carousel.prev();
  }
  openConfirmModal(modal, type) {    
    this.notifiType = type;
    this.modalService.open(modal).result.then(
      res => {
        
        this.notifiType = '';
      },
      res => {
        console.log("!openConfirmModal");
        this.notifiType = '';
      }
    );
  }

}
