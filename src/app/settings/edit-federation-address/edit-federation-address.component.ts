import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import { environment } from 'src/environments/environment';
import { AuthService } from "../../shared/services/auth.service"
import {SubSink} from 'subsink';
import {SettingsService} from '../settings.service';
import {ErrorService} from '../../shared/error/error.service';
import axios from 'axios'
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-federation-address',
  templateUrl: './edit-federation-address.component.html',
  styleUrls: ['./edit-federation-address.component.css']
})
export class EditFederationAddressComponent implements OnInit {
  
  @ViewChild('content') modal;
  form: FormGroup;
  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private setting: SettingsService,
    private http: HttpClient,
  ) { 
    this.initializeForm()
    
  }

  private initializeForm() {
    this.form = this.formBuilder.group({     
      federation: [null, 
        [ Validators.pattern(/^(?=.*[a-z])([0-9A-Za-z.@]+)$/),
          Validators.minLength(4),
          Validators.maxLength(36)]]
    });
  }
  ngOnInit() {
    this.popupService.open(this.modal);
  }
  get federation() { return this.form.get('federation'); }
  save() {
    if (this.form.invalid) {
      this.snotifyService.simple('Federation address is invalid.');
      return
    }
    this.http.post(`api/v1/users/editfederation`, {federation: this.federation.value}).subscribe(
      res => {        
        if ((res as any).valid === true ) {                
          this.authService.userData.Federation = this.federation.value 
          if (!this.authService.userData.Federation.endsWith('*grayll.io')){
            this.authService.userData.Federation = this.authService.userData.Federation + '*grayll.io'
          }
          this.setting.sendFederationAddressObserver(this.authService.userData.Federation)
          this.authService.SetLocalUserData()     
          this.form.reset()   
          this.popupService.close()
          .then(() => {
            setTimeout(() => {
              this.snotifyService.simple('Your federation address saved.');        
            }, 50);
          })         
        } else {
          switch ((res as any).errCode){
            case environment.INVALID_PARAMS:
              this.snotifyService.simple('Please check you input federation address.');
              break
            case environment.INTERNAL_ERROR:
              this.snotifyService.simple(`Currently the federation address can't be updated. Please try again later!`);
              break
            case environment.INVALID_UNAME_PASSWORD:
                this.snotifyService.simple('The federation address is already used by other user. Please choose another one.');
                break
          }
        }
      },
      err => {
        this.snotifyService.simple(`Currently the federation address can't be updated. Please try again later!`);
      }
    )
  }

}
