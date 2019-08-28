import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {PopupService} from '../../../shared/popup/popup.service';
import {SnotifyService} from 'ng-snotify';
import {ErrorService} from '../../../shared/error/error.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  @ViewChild('content') modal;
  form: FormGroup;

  get currentPassword() { return this.form.get('currentPassword'); }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmNewPassword() { return this.form.get('confirmNewPassword'); }

  constructor(
    public popupService: PopupService,
    private snotifyService: SnotifyService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder
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

  ngOnInit() {
    this.popupService.open(this.modal);
  }

  private clientValidation(): boolean {
    if (!this.currentPassword.value || !this.newPassword.value || !this.confirmNewPassword.value) {
      this.errorService.handleError(null, 'All fields are required.');
      return false;
    }
    if (this.confirmNewPassword.value !== this.newPassword.value) {
      this.errorService.handleError(null, 'Please correctly confirm your new password.');
      return false;
    }
    return true;
  }

  save() {
    this.errorService.clearError();
    if (this.clientValidation()) {
      this.onSaveSuccess();
    }
  }

  onSaveSuccess() {
    this.popupService.close().then(() => {
      this.snotifyService.simple('Account password saved.');
    });
  }

}
