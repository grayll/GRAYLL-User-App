import {Component} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import {faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from "../../shared/services/auth.service"
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent {

  federationAddress: string;
  stellarAddress: string;

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
  ) {
    this.buildForm()     

    this.userData = this.authService.GetLocalUserData()
    if (!this.userData.Lname){
      this.userData.Lname = ''
    }
    if (!this.userData.federationAddress){
      this.federationAddress = this.userData.Email + '*grayll.io';
    } else {
      this.federationAddress = this.userData.federationAddress;
    }
    this.stellarAddress = 'DKJNSFUIHLJ238OHUIDLFJN23023OHUIFSDKJNS032P3DSKJAFNLSD';

     
  }
 
  buildForm(): void {    
    this.profileForm = this.formBuilder.group({
     
      'first_name': ['', [Validators.required, Validators.minLength(3),
        Validators.maxLength(25)]],  
      'last_name': ['', [Validators.minLength(3),
          Validators.maxLength(25)]],      
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
    console.log('userData:', this.userData)
    if (!this.onValueChanged()) {
      return;
    }
    if (this.profileForm.value['first_name'] && this.profileForm.value['first_name'] != ''){
      this.authService.userData.name = this.profileForm.value['first_name']
    }
    if (this.profileForm.value['last_name'] && this.profileForm.value['last_name'] != ''){
      this.authService.userData.lname = this.profileForm.value['last_name']
    }
    if (this.profileForm.value['phone'] && this.profileForm.value['phone'] != ''){
      this.authService.userData.phone = this.profileForm.value['phone']
    }
    
    this.authService.SetLocalUserData()
    this.authService.SetUserData(this.authService.userData)
    this.snotifyService.simple('Your changes are saved.');
  }

}
