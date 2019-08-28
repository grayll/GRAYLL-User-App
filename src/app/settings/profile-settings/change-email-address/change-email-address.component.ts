import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../../shared/error/error.service';
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-change-email-address',
  templateUrl: './change-email-address.component.html',
  styleUrls: ['./change-email-address.component.css']
})
export class ChangeEmailAddressComponent implements OnInit {

  @ViewChild('content') modal;
  form: FormGroup;

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
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.formBuilder.group({
      currentEmail: [null, [Validators.required, Validators.email]],
      newEmail: [null, [Validators.required, Validators.email]],
      confirmNewEmail: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
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
    return true;
  }

  save() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      this.authService.SignIn(this.currentEmail.value, this.password.value).
      //this.afsAuth.auth.signInWithEmailAndPassword(this.currentEmail.value, this.password.value).
      then(userCredential =>
      {
        userCredential.user.updateEmail(this.newEmail.value).then(()=>{    
            this.authService.userData.Email = this.newEmail.value
            
            this.authService.UpdateEmail(userCredential.user.uid, this.newEmail.value).then(()=>{
              //this.onSaveSuccess();
              this.authService.SetLocalUserData()
              this.authService.SendVerificationMail().then(()=> {
                this.errorService.handleError(null, 'New email is udpated. Please verify new email address before login!');
                this.authService.SignOut()
              }).catch (err => {
                this.errorService.handleError(null, 'Can not send verification to new email address!');
              })
            }).catch(err=> {
              this.errorService.handleError(null, 'Can not update new email address. Please try again later!');
            })            
          }
        ).catch(err => {
          this.errorService.handleError(null, err.message);
        })        
      })
      .catch (err => {
        this.errorService.handleError(null, 'Can not update new email address. Please try again later!');
      })     
    }
  }

  onSaveSuccess() {
    this.popupService.close().then(() => {
      this.snotifyService.simple('New Email address is updated.');
    });
  }

}
