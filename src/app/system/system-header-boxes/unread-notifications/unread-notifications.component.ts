import {Component, OnInit} from '@angular/core';
import {NotificationsService} from '../../../notifications/notifications.service';
import {faBell, faSearch, faTimes} from '@fortawesome/free-solid-svg-icons';
import {NoticeId} from '../../../notifications/notification.model';
import {CustomModalService} from '../../../shared/custom-modal.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AlgoService } from '../../algo.service';
import { Observable } from 'rxjs';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-unread-notifications',
  templateUrl: './unread-notifications.component.html',
  styleUrls: [
    './unread-notifications.component.css',
    '../../../shared/custom-modal.scss'
  ]
})

export class UnreadNotificationsComponent implements OnInit {

  // gry1notifications: GRY1NotificationModel[];
  // gry2notifications: GRY1NotificationModel[];
  // gry3notifications: GRY1NotificationModel[];
  // grznotifications: GRY1NotificationModel[];

  // Font Awesome Icons
  faSearch = faSearch;
  faBell = faBell;
  faTimes = faTimes;

  notices: Observable<NoticeId[]>;
  noticesAlgo: Observable<NoticeId[]>;
  noticesGeneral: Observable<NoticeId[]>;

  // lastCursorWallet:number = 0
  // lastCursorAlgo:number = 0
  // lastCursorGeneral:number = 0

  walletPath:string
  algoPath:string
  generalPath:string
  limit:number = 200

  readWalletNoticeIds: string[] = []
  readAlgoNoticeIds: string[] = []
  readGeneralNoticeIds: string[] = []

  constructor(
    public notificationsService: NotificationsService,
    private customModalService: CustomModalService,
    public authService: AuthService,
    //public stellarService: StellarService,
    private http: HttpClient,
    //private loadingService: LoadingService,
    private algoService: AlgoService,
    public dataService:NoticeDataService,
    
  ) {    
    this.algoPath = 'notices/algo/'+this.authService.userData.Uid  

    console.log('algoService.noticeId', this.algoService.noticeId)
    //if (this.algoService.noticeId == 'unread-grz-notifications'){
      this.dataService.firstAlgoType(this.algoPath, this.limit, "GRZ" )
      this.noticesAlgo = this.dataService.algoData  
   // }
   
  }

  ngOnInit() {
    this.loadPopupElementsById();
  }

  private loadPopupElementsById() {
    const elements: NodeListOf<Element> = document.querySelectorAll('.mobile-system-nots');
    this.customModalService.gry1mobileScrollContainer = elements[0];
    this.customModalService.gry2mobileScrollContainer = elements[1];
    this.customModalService.gry3mobileScrollContainer = elements[2];
    this.customModalService.grzmobileScrollContainer = elements[3];
  }

  

  // private populateNumberOfUnreadNotifications() {
  //   this.notificationsService.resetNumberOfAllGrayllSystemNotifications();
  //   const gry1Unread = this.gry1notifications.filter((n) => !n.isRead).length;
  //   const gry2Unread = this.gry2notifications.filter((n) => !n.isRead).length;
  //   const gry3Unread = this.gry3notifications.filter((n) => !n.isRead).length;
  //   const grzUnread = this.grznotifications.filter((n) => !n.isRead).length;
  //   this.notificationsService.increaseNumberOfAllGrayllSystemNotificationsBy(gry1Unread + gry2Unread + gry3Unread + grzUnread);
  //   this.notificationsService.numberOfGRY1Notifications = gry1Unread;
  //   this.notificationsService.numberOfGRY2Notifications = gry2Unread;
  //   this.notificationsService.numberOfGRY3Notifications = gry3Unread;
  //   this.notificationsService.numberOfGRZNotifications = grzUnread;
  // }

  

  markAsRead(collPath: string, notice:any) {
    //console.log('notice-com:markAsRead')
    if (!notice.isRead) {
      console.log('notice-com:markAsRead not isread')
      notice.isRead = true;       
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
    }
  }

  closePopup(id: string) {
    // switch (id) {
    //   case 'unread-gry1-notifications':
    //     this.gry1notifications = this.gry1notifications.filter((n) => !n.isRead);
    //     break;
    //   case 'unread-gry2-notifications':
    //     this.gry2notifications = this.gry2notifications.filter((n) => !n.isRead);
    //     break;
    //   case 'unread-gry3-notifications':
    //     this.gry3notifications = this.gry3notifications.filter((n) => !n.isRead);
    //     break;
    //   default:
    //     // Send read ids to server
      
    //     break;
    // }
    if (this.readAlgoNoticeIds.length > 0){
      //console.log('this.readAlgoNoticeIds', this.readAlgoNoticeIds)
      this.http.post(`api/v1/users/updateReadNotices`, {walletIds:this.readWalletNoticeIds, algoIds:this.readAlgoNoticeIds, 
        generalIds:this.readGeneralNoticeIds, 
        urgrz:this.authService.userMetaStore.UrGRZ, urgry1:this.authService.userMetaStore.UrGRY1,
        urgry2:this.authService.userMetaStore.UrGRY2, urgry3:this.authService.userMetaStore.UrGRY3}).
      subscribe(res => {
        console.log('updateReadNotices', res)
        if ((res as any).errCode == environment.SUCCESS){         
          console.log("Updated read notice ids")
        }        
      },
      e => {
        console.log(e)
      })
    }
    this.customModalService.close(id);
  }

}
