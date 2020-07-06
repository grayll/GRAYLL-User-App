import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {UserModel} from '../../../models/user.model';
import {PopupService} from '../popup.service';
import {SettingsService} from '../../../settings/settings.service';
import {ErrorService} from '../../error/error.service';
import {UserService} from '../../../authorization/user.service';
import {SharedService} from '../../shared.service';
import {faCircle} from '@fortawesome/free-solid-svg-icons';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-xlm-edit-popup',
  templateUrl: './xlm-referral-edit-popup.component.html',
  styleUrls: ['./xlm-referral-edit-popup.component.scss']
})
export class XlmReferralEditPopupComponent implements OnInit {

  @ViewChild('content') modal;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  faPhone = faCircle;

  submitted = false;  
  registerForm: FormGroup;

  referralId:string

  constructor(
    public popupService: PopupService,    
    private errorService: ErrorService,    
    private formBuilder: FormBuilder,   
    private router: Router, public authService: AuthService,  
    private http: HttpClient,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
  ) {
       
  }
  ngOnInit() {
    this.popupService.open(this.modal);
    this.buildForm()  
    this.registerForm.valueChanges.subscribe(change => {
      this.submitted = true;      
      this.onValueChanged()
    })
    this.route.params.subscribe((param) => {      
      this.referralId = param.id;      
    })
  }

  buildForm(): void {    
    this.registerForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9]/),]],   
      'lname': ['', [Validators.required, Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9]/)]],  
      'businessName': ['', [Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9]/)]],       
      'email': ['', [
          Validators.required,        
          Validators.pattern(/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$/),
        ]
      ],
      // 'sendWhatAppChk':[],
      'phone': ['', [        
        Validators.pattern(/^[0-9]{6,15}$/),
      ]],     
      });
      //this.onValueChanged();
  }

  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.registerForm) { return; }
    const form = this.registerForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);      
      if (control && control.invalid) {        
        const messages = this.validationMessages[field];        
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }        
      }
    }

    if (!this.formErrors.email){
      (<any>window)._nb.api.getValidatePublic(this.registerForm.value['email'],
      res => {                    
          if (res.response.result != 'valid'){
            this.formErrors.email = 'The email is invalid.'
          }
      },
      err => {              
          this.formErrors.email = 'The email validation can not be processed right now.'
      })
    }
  }

  formErrors = {
    'name':'',
    'lname':'',
    'businessName':'',
    'email': '', 
    'phone': '',             
  };

  validationMessages = {  
    'name':{
      'required':      'First Name is required.',
      'minlength':      'First Name must be at least 2 characters long.',
      'maxlength':      'First Name cannot be more than 25 characters long.',
      'pattern':         'First Name must be characters or numbers'
    },      
    'lname':{
      'required':      'Last Name is required.',
      'minlength':      'Last Name must be at least 2 characters long.',
      'maxlength':      'Last Name cannot be more than 25 characters long.',
      'pattern':         'First Name must be characters or numbers.'
    },
    'businessName':{      
      'minlength':      'Business Name must be at least 2 characters long.',
      'maxlength':      'Business Name cannot be more than 25 characters long.',
      'pattern':         'Business Name must be characters or numbers.'
    },
    'email': {
      'required':      'Email is required.',
      'pattern':       'Email must be a valid email'
    },
    'phone': {      
      'pattern':       'Phone number must be a valid number'
    },
      
  };

get f() { return this.registerForm.controls; }

editReferral() {
  
  this.submitted = true;
  this.errorService.clearError();
  this.onValueChanged()
  // stop here if form is invalid
  if (this.registerForm.invalid) {
      //console.log('form invalid', this.formErrors)    
      //this.error = true 
      return;
  }  
  

  // Neverbounce verifies email
  let email = this.registerForm.value['email']
  let name = this.registerForm.value['name']
  let lname = this.registerForm.value['lname']
  let businessName = this.registerForm.value['businessName']
  let phone = this.registerForm.value['phone']
  this.loadingService.show()

  let userData = {email:email, name:name, lname:lname, businessName:businessName, phone:phone, refererUid:this.referralId}
  this.http.post(`api/v1/users/editreferral`, userData)             
    .subscribe(res => { 
      this.loadingService.hide() 
      if ((res as any).errCode == environment.EMAIL_IN_USED)  {
        let content = "The email is already registered."
        this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else if ((res as any).errCode == environment.INVALID_ADDRESS){
        let content = "The email is invalid."
        this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else if ((res as any).errCode == environment.INTERNAL_ERROR){
        let content = "Currently, Update can't be processed. Please try again later!"
        this.errorService.handleError(null, content)
        //this.registerForm.reset() 
      } else {              
        this.success = true
      }
    },
    error => {
      this.loadingService.hide()
      console.log(error) 
      //this.registerForm.reset()              
      this.errorService.handleError(null, `Currently, Update can't be processed. Please try again later!`)     
    })
}

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

}
