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
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnDestroy {
  private subscriptions = new SubSink();

  federationAddress: string ='';
  stellarAddress: string = '';

  faCheck = faCheck;
  faExclamation = faExclamation;
  userData: any;
  phoneNumber: string = ''
  profileForm: FormGroup;

  constructor(
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private settingsService: SettingsService,
    private swPush: SwPush,
    private http: HttpClient,
  ) {
    this.buildForm()     

    this.userData = this.authService.GetLocalUserData()
    if (!this.userData.LName){
      this.userData.LName = ''
    }
    if (!this.userData.Name){
      this.userData.Name = ''
    }
    if (this.userData.Federation){
      this.federationAddress = this.userData.Federation;
    }
    if (this.userData.PublicKey){
      this.stellarAddress = this.userData.PublicKey;  
    }
    
    this.subscriptions.add(this.settingsService.observeFederationAddress().subscribe(
      fed => {
        this.authService.userData.Federation = fed
        this.federationAddress = fed
      }
    ))

    if (this.userData.Phone){
      this.phoneNumber = this.userData.Phone
    }

    //this.requestSubNotifications()
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
       'inlineFormInputGroup': ['', [
        Validators.pattern('/^\d{1,10}$/'),       
     ]],  
      });
  }

  // requestSubNotifications() {
  //   const VAPID_PUBLIC_KEY = "BGHhiED8J7t9KwJlEgNXT-EDIJQ1RZPorhuSYtufaRezRTGhofadZtrgZ8MVa0pwISEyBZRaYa-Bzl9MHtwaF9s"
  //   this.swPush.requestSubscription({
  //       serverPublicKey: VAPID_PUBLIC_KEY
  //   })
  //   .then(sub => {     
  //     this.http.post(`api/v1/users/savesubcriber`, sub).subscribe(res => {
  //       if ((res as any).errCode == environment.SUCCESS){
  //         console.log("subs are saved")
  //       }
  //     },
  //     err => {
  //       console.log("subs err:", err)
  //     })
  //   }),
  //   err => console.error("Could not subscribe to notifications!", err);
  // }

  // Updates validation state on form changes.
  onValueChanged(data?: any): boolean {
    if (!this.profileForm) { return; }
    const form = this.profileForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      //console.log('control:', control)  
      if (control && control.touched && control.invalid) {
        
        const messages = this.validationMessages[field];
       // console.log('control invalid:', control, messages)  
        
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
      'email':         'Email must be valid!'
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
    if (this.profileForm.value['first_name'] && this.profileForm.value['first_name'] != '' 
    && this.profileForm.value['first_name'] != this.userData.Name){      
      //console.log('change fname')
      hasChange = true
    }
    if (this.profileForm.value['last_name'] && this.profileForm.value['last_name'] != '' 
    && this.profileForm.value['last_name'] != this.userData.LName){      
      hasChange = true
      //console.log('change lname')
    }
  
    tmp.name = this.profileForm.value['first_name']
    tmp.lname = this.profileForm.value['last_name']
    //console.log('tmp: ', tmp)
    //tmp.phone = this.profileForm.value['phone']
    if (!hasChange){
      return
    }

    this.http.post(`api/v1/users/updateprofile`, tmp).subscribe(res => {        
        if ((res as any).valid === true ) {
          if (tmp.name) {
            this.authService.userData.Name = tmp.name
          }
          if (tmp.lname) {
            this.authService.userData.LName = tmp.lname
          }
          
          this.userData = this.authService.userData  
          //console.log('tmp1: ', this.userData)       
          this.authService.SetLocalUserData()     
          
          //this.profileForm.reset()   
          this.snotifyService.simple('Your changes have been saved.');
        } else {
          switch ((res as any).errCode){
            case environment.INVALID_PARAMS:
              this.snotifyService.simple('The data entered is invalid.');
              break
            case environment.INTERNAL_ERROR:
              this.snotifyService.simple(`The profile could not be updated! Please retry.`);
              break
          }
        }
      },
      err => {
        this.snotifyService.simple(`The profile could not be updated! Please retry.`);
      })   
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
