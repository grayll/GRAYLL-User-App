import {Component, OnInit} from '@angular/core';
import {NotificationsService} from '../../../notifications/notifications.service';
import {faBell, faSearch, faTimes, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {NoticeId} from '../../../notifications/notification.model';
import {CustomModalService} from '../../../shared/custom-modal.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AlgoService } from '../../algo.service';
import { Observable } from 'rxjs';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-unread-notifications',
  templateUrl: './unread-notifications.component.html',
  styleUrls: [
    './unread-notifications.component.css',
    '../../../shared/custom-modal.scss'
  ]
})

export class UnreadNotificationsComponent implements OnInit {

  notifiType: any = '';

  // Font Awesome Icons
  faSearch = faSearch;
  faBell = faBell;
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;

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
    private http: HttpClient,
    private loadingService: LoadingService, 
    public modalService: NgbModal,
    public dataService:NoticeDataService,    
  ) {    
    this.algoPath = 'notices/algo/'+this.authService.userData.Uid     
    this.dataService.firstAlgoType(this.algoPath, this.limit)    
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

  markAsRead(collPath: string, notice:any) {
    //console.log('notice-com:markAsRead')
    if (!notice.isRead) {
      //console.log('notice-com:markAsRead not isread')
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
    if (this.readAlgoNoticeIds.length > 0){
      //console.log('this.readAlgoNoticeIds', this.readAlgoNoticeIds)
      this.http.post(`api/v1/users/updateReadNotices`, {walletIds:this.readWalletNoticeIds, algoIds:this.readAlgoNoticeIds, 
        generalIds:this.readGeneralNoticeIds, 
        urgrz:this.authService.userMetaStore.UrGRZ, urgry1:this.authService.userMetaStore.UrGRY1,
        urgry2:this.authService.userMetaStore.UrGRY2, urgry3:this.authService.userMetaStore.UrGRY3}).
          subscribe(res => {
        //console.log('updateReadNotices', res)
          if ((res as any).errCode == environment.SUCCESS){         
            //console.log("Updated read notice ids")
          }        
      },
      e => {
        console.log(e)
      })
    }
    this.customModalService.close(id);
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
  
 
  openConfirmModal(modal, type) {    
    this.notifiType = type;
    this.modalService.open(modal).result.then(
      res => {        
        this.notifiType = '';
      },
      err => {
        console.log("!openConfirmModal",err);
        this.notifiType = '';
      }
    );
  }

}
