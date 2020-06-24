import {Component, OnInit, ViewChild} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import {faCircle} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-xlm-referrer-popup',
  templateUrl: './xlm-referrer-remove-popup.component.html',
  styleUrls: ['./xlm-referrer-remove-popup.component.scss']
})
export class XlmReferrerRemovePopupComponent implements OnInit {

  @ViewChild('content') modal;
  
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  faPhone = faCircle;

  private user: UserModel;
  refererId: string

  constructor(
    public popupService: PopupService,
    private userService: UserService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
  ) {
    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.route.params.subscribe((param) => {      
      this.refererId = param.id;      
    })
  }

  removeReferer(){
    this.loadingService.show()
    this.http.post(`api/v1/users/removeReferer/`+this.refererId, {})             
    .subscribe(res => { 
      console.log(res)
      this.loadingService.hide() 
      if ((res as any).errCode != environment.SUCCESS)  {
       this.error = true        
      } else {              
        this.success = true
      }
    },
    error => {
      this.loadingService.hide()
      console.log(error) 
      this.error = true
    })
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

}
