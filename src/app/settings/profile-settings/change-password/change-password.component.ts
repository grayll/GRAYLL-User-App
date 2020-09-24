import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PopupService} from '../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {ErrorService} from '../../../shared/error/error.service';
import { MustMatch } from 'src/app/authorization/services/helper/helper.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  @ViewChild('content') modal;
  form: FormGroup;
  message: string = ''
  get currentPassword() { return this.form.get('currentPassword'); }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmNewPassword() { return this.form.get('confirmNewPassword'); }

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,    
    private router: Router,
    
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.formBuilder.group({
      currentPassword: null,
      newPassword: null,
      confirmNewPassword: null
    });
  }
  initializeForm1(): void {
    // this.form = this.formBuilder.group({      
    //   currentPassword: ['', [ Validators.required,
    //     Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?]+)$/),          
    //   Validators.minLength(8),
    //   Validators.maxLength(36)]], 
    //   newPassword: ['', [ Validators.required,
    //     Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?]+)$/),          
    //   Validators.minLength(8),
    //   Validators.maxLength(36)]],      
    //   confirmNewPassword: ['', Validators.required]
    //   },{
    //     validator: MustMatch('newPassword', 'confirmNewPassword')
    // });
    
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  private clientValidation(): boolean {
    var pwdPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?])([0-9A-Za-z!~@#$%^&*()`_?\-\=\+\[{}\]\\;':"|,.<>/?]+)$/;
    let msgs = [   'Password must include at least one letter, one number, one capital and one special character.',
    'Password length must be from 8 to 36 characters long.']

    if (!this.currentPassword.value || !this.newPassword.value || !this.confirmNewPassword.value) {
      this.errorService.handleError(null, 'All fields are required!');
      return false;
    }
   

    if (!this.currentPassword.value.match(pwdPattern)){
      this.errorService.handleError(null, msgs[0]);
      return false;
    }

    if (this.currentPassword.value.length < 8 || this.currentPassword.value.length > 36){
      this.errorService.handleError(null, msgs[1]);
    }

    if (!this.newPassword.value.match(pwdPattern)){
      this.errorService.handleError(null, msgs[0]);
      return false;
    }

    if (this.newPassword.value.length < 8 || this.newPassword.value.length > 36){
      this.errorService.handleError(null, msgs[1]);
    }

    if (this.confirmNewPassword.value !== this.newPassword.value) {
      this.errorService.handleError(null, 'Please the new password is not matched!');
      return false;
    }
    return true;
  }



  save() {
    this.errorService.clearError();
    if (!this.clientValidation()){
      return
    }
    this.http.post(`api/v1/users/ChangePassword`, 
        { password: this.currentPassword.value, newPassword:this.newPassword.value})             
      .subscribe(res => {  
        if ((res as any).errCode == environment.SUCCESS)  {          
          this.authService.userInfo.EnSecretKey = ''
          this.authService.hash = this.newPassword.value
          this.onSaveSuccess();
        } else if((res as any).errCode == environment.INVALID_UNAME_PASSWORD ){
          this.message = "The current password is invalid."
          this.errorService.handleError(null, this.message)
          this.form.reset() 
        } else if((res as any).errCode == environment.INVALID_PARAMS ){
            this.message = "The reset password or new password is invalid."
            this.errorService.handleError(null, this.message)
            this.form.reset()        
        } else {   
          this.form.reset()  
          this.message = 'Can not reset password right now. Please retry!'
          this.errorService.handleError(null, this.message);
        }
      },
      error => {
        console.log(error)               
        this.message = 'Can not reset password right now. Please retry!'
        this.errorService.handleError(null, this.message);
      }) 
    
  }

  onSaveSuccess() {
    this.popupService.close().then(() => 
    { 
      this.snotifyService.simple('New password has been saved!');
      setTimeout(() => {
        if (this.authService.userInfo.EnSecretKey == '' && this.authService.userInfo.PublicKey != ''){
          this.router.navigate([{outlets: {popup: 'reactivate-account'}}], {relativeTo: this.route.parent});
        }
      }, 200);      
    });
    
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }
    const form = this.form;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      console.log('control:', control)  
      if (control && control.invalid) {
        const messages = this.validationMessages[field];
        //this.errorService.handleError(null, 'Please enter the valid secret key!');
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {    
    'currentPassword': '',
    'newPassword': '',
    'confirmNewPassword':''
  };

  validationMessages = {    
    'currentPassword': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },
    'newPassword': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },
    'confirmNewPassword': {
      'required':      'Password is required.',
      'mustMatch':     'Password must be matched.'     
    }
  };  

}
