import {Component, OnDestroy} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from "../../shared/services/auth.service"
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import axios from 'axios'
import { environment } from 'src/environments/environment';
import {SubSink} from 'subsink';
import {SettingsService} from '../settings.service';
import {SwPush, SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnDestroy {
  private subscriptions = new SubSink();

  readonly VAPID_PUBLIC_KEY = "BGHhiED8J7t9KwJlEgNXT-EDIJQ1RZPorhuSYtufaRezRTGhofadZtrgZ8MVa0pwISEyBZRaYa-Bzl9MHtwaF9s"

  federationAddress: string ='';
  stellarAddress: string = '';

  faCheck = faCheck;
  faExclamation = faExclamation;
  userData: any;

  profileForm: FormGroup;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private settingsService: SettingsService,
    private swPush: SwPush,
  ) {
    this.buildForm()     

    this.userData = this.authService.GetLocalUserData()
    if (!this.userData.Lname){
      this.userData.Lname = ''
    }
    if (this.userData.Federation){
      this.federationAddress = this.userData.Federation;
    }
    if (this.userData.PublicKey){
      this.stellarAddress = this.userData.PublicKey;  
    }
    
    this.subscriptions.sink = this.settingsService.observeFederationAddress().subscribe(
      fed => {
        this.authService.userData.Federation = fed
        this.federationAddress = fed
      }
    )

    this.requestSubNotifications()
  }
 
  buildForm(): void {    
    this.profileForm = this.formBuilder.group({
     
      'first_name': ['', [Validators.required, Validators.minLength(3),
        Validators.maxLength(50)]],  
      'last_name': ['', [Validators.minLength(3),
          Validators.maxLength(50)]],      
      'email': ['', [
          Validators.required,
          Validators.email
        ]
      ],
      'phone': ['', [
          Validators.pattern('/^\d{1,10}$/'),
          Validators.minLength(6),
          Validators.maxLength(15)
       ]],  
       'inlineFormInputGroup':['+387 63 763 354'],
      });
  }

  requestSubNotifications() {
    this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => { 
      console.log("sub:", sub)
    })
    .catch(err => console.error("Could not subscribe to notifications", err));
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any): boolean {
    if (!this.profileForm) { return; }
    const form = this.profileForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      console.log('control:', control)  
      if (control && control.touched && control.invalid) {
        
        const messages = this.validationMessages[field];
        console.log('control invalid:', control, messages)  
        
        for (const key in control.errors) {
          this.errorService.handleError(null, messages[key])
          return false;
        }
        
      }
    }
    return true;
  }

  formErrors = {   
    'first_name':'',
    'last_name':'',
    'email': '',
    'phone': '',    
  };

  validationMessages = {
        
    'first_name':{      
      'minlength':      'First Name must be at least 3 characters long.',
      'maxlength':      'First Name cannot be more than 25 characters long.'
    },
    'last_name':{      
      'minlength':      'Last Name must be at least 3 characters long.',
      'maxlength':      'Last Name cannot be more than 25 characters long.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email must be a valid email'
    },
    'phone': {     
      'pattern':       'Phone must be number.',
      'minlength':     'Phone must be at least 8 numbers.',  
      'maxlength':     'Phone cannot be more than 15 numbers.'    
    },    
  };

  copyFederationAddress() {
    if (this.clipboardService.copyFromContent(this.federationAddress)) {
      this.snotifyService.simple('Federation address copied.');
    }
  }

  copyStellarAddress() {
    if (this.clipboardService.copyFromContent(this.stellarAddress)) {
      this.snotifyService.simple('Stellar address copied.');
    }
  }

  save() {
    this.errorService.clearError();   
    if (!this.onValueChanged()) {
      return;
    }
    let hasChange = false
    let tmp: any = {}
    if (this.profileForm.value['first_name'] && this.profileForm.value['first_name'] != ''){      
      hasChange = true
    }
    if (this.profileForm.value['last_name'] && this.profileForm.value['last_name'] != ''){      
      hasChange = true
    }
    if (this.profileForm.value['phone'] && this.profileForm.value['phone'] != ''){      
      hasChange = true
    }
    tmp.name = this.profileForm.value['first_name']
    tmp.lname = this.profileForm.value['last_name']
    tmp.phone = this.profileForm.value['phone']
    if (!hasChange){
      return
    }

    axios.post(`${environment.api_url}api/v1/users/updateprofile`, tmp,
      { headers: { Authorization: 'Bearer ' + this.authService.userData.token}})
      .then(res => {
        console.log(res)
        if (res.data.valid === true ) {
          if (tmp.name) {
            this.authService.userData.name = tmp.name
          }
          if (tmp.lname) {
            this.authService.userData.lname = tmp.lname
          }
          if (tmp.phone) {
            this.authService.userData.phone = tmp.phone
          }          
          this.authService.SetLocalUserData()     
          this.profileForm.reset()   
          this.snotifyService.simple('Your changes are saved.');
        } else {
          switch (res.data.errCode){
            case environment.INVALID_PARAMS:
              this.snotifyService.simple('Please check you information.');
              break
            case environment.INTERNAL_ERROR:
              this.snotifyService.simple('Can not update profile right now. Please try again later.');
              break
          }
        }
      }).catch( err => {
        this.snotifyService.simple('Can not update profile right now. Please try again later.');
      })
        
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
