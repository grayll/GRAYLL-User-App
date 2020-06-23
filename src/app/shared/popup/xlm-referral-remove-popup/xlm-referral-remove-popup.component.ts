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
  selector: 'app-xlm-referral-popup',
  templateUrl: './xlm-referral-remove-popup.component.html',
  styleUrls: ['./xlm-referral-remove-popup.component.scss']
})
export class XlmReferralRemovePopupComponent implements OnInit {

  @ViewChild('content') modal;
  currentXLMBalance: number;
  XLMLoanValue = 1.5;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  faPhone = faCircle;

  private user: UserModel;
  referralId: string

  constructor(
    public popupService: PopupService,
    private settingsService: SettingsService,
    private errorService: ErrorService,
    private userService: UserService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {
   
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.route.params.subscribe((param) => {   
      console.log(param)   
      this.referralId = param.id;      
    })
  }

  removeReferral(){
    this.loadingService.show()
    this.http.post(`api/v1/users/removeReferral/`+this.referralId, {})             
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
      //this.errorService.handleError(null, `Currently, Invitation can't be processed. Please try again later!`)     
    })

  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

}
