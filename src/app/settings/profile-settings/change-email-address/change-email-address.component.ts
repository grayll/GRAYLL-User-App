import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../../shared/error/error.service';
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AuthService } from 'src/app/shared/services/auth.service';
import axios from 'axios'
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-change-email-address',
  templateUrl: './change-email-address.component.html',
  styleUrls: ['./change-email-address.component.css']
})
export class ChangeEmailAddressComponent implements OnInit {

  @ViewChild('content') modal;
  form: FormGroup;
  currentMail:string;
  get currentEmail() { return this.form.get('currentEmail'); }
  get newEmail() { return this.form.get('newEmail'); }
  get confirmNewEmail() { return this.form.get('confirmNewEmail'); }
  get password() { return this.form.get('password'); }

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private afsAuth: AngularFireAuth,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.formBuilder.group({
      currentEmail: [null, [Validators.required, Validators.email]],
      newEmail: [null, [Validators.required, Validators.email]],
      confirmNewEmail: [null, [Validators.required, Validators.email]],
      password: [null, 
        [ Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
          Validators.minLength(8),
          Validators.maxLength(36)]]
    });
  }

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  private clientValidation(): boolean {
    if (!this.currentEmail.value || !this.newEmail.value || !this.confirmNewEmail.value) {
      this.errorService.handleError(null, 'All fields are required.');
      return false;
    }
    if (!this.errorService.isEmailAddressValid(this.currentEmail.value)) {
      this.errorService.handleError(null, 'Please enter a valid current email address.');
      return false;
    }
    if (!this.errorService.isEmailAddressValid(this.newEmail.value)) {
      this.errorService.handleError(null, 'Please enter a valid new email address.');
      return false;
    }
    if (this.confirmNewEmail.value !== this.newEmail.value) {
      this.errorService.handleError(null, 'Please correctly confirm your new email address.');
      return false;
    }
    if (this.password.invalid) {
      this.errorService.handleError(null, 'Please enter valid password.');
      return false;
    }
    this.currentMail = this.currentEmail.value
    return true;
  }

  save() {
    this.errorService.clearError();
    if (this.clientValidation()) {      
      this.http.post(`api/v1/users/changeemail`, 
        {email:this.currentEmail.value, newemail: this.newEmail.value, password: this.password.value})                
      .subscribe(res => {      
        console.log(res)          
        if ((res as any).errCode === environment.SUCCESS) {
          this.form.reset()   
          this.errorService.handleError(null, `An email was sent to ${this.currentMail} to confirm change email request.`);
        } else {
          switch ((res as any).errCode) {
            case environment.INVALID_UNAME_PASSWORD:
              this.form.reset()   
              this.errorService.handleError(null, 'The email or password is invalid!')
              break
            case environment.EMAIL_NOT_EXIST:
              this.form.reset()   
              this.errorService.handleError(null, 'The provided email does not exist.')
              break
            case environment.TOKEN_INVALID:
              this.form.reset()   
              this.errorService.handleError(null, 'Invalid request.')
              break
          }
          
        }
      }),
      error => {        
        console.log(error)                  
        this.errorService.handleError(null, `Currently the email address can't be updated. Please try again later!`);
        this.form.reset()    
      };            
    }
  }

  onSaveSuccess() {
    this.popupService.close().then(() => {
      this.snotifyService.simple('New Email address is updated.');
    });
  }

}
