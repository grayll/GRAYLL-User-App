import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import {Router} from '@angular/router';
import {UserService} from '../../../authorization/user.service';
import { AuthService } from "../../../shared/services/auth.service"
import { User, Setting } from "../../../shared/services/user";
import { StellarService } from '../../../authorization/services/stellar-service';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ErrorService} from '../../../shared/error/error.service';

@Component({
  selector: 'app-pay-loan-popup',
  templateUrl: './activate-account-popup.html',
  styleUrls: ['./activate-account-popup.component.scss']
})
export class ActivateAccountPopupComponent implements OnInit {

  @ViewChild('content') modal;
  error: boolean;
  success: boolean;
  didShowErrorOnce: boolean;
  frm: FormGroup;

  constructor(
    private popupService: PopupService,
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private stellarService: StellarService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
  ) { }

  ngOnInit() {
    this.buildForm() 
    this.popupService.open(this.modal);
  }
  buildForm(): void {    
    this.frm = this.formBuilder.group({      
      'password': ['', [       
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?\\\\=\\\\+[\]{};':"|,.<>\/?]+)$/),
        Validators.minLength(8),
        Validators.maxLength(36)
       ]
      ],  
    });
  }
  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.frm) { return; }
    const form = this.frm;
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
  }

  formErrors = {    
    'password': '',    
  };

  validationMessages = {      
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },    
  };
  activate() {
    this.errorService.clearError();
    this.onValueChanged()
    //if (this.didShowErrorOnce) {
      this.error = false;
      this.success = true;
      let pair = this.stellarService.generateKeyPair();
      this.stellarService.encryptSecretKey(this.frm.value['password'], pair.rawSecretKey(), (encryptedSecret) => { 
        console.log(encryptedSecret)
      })
     
      //this.userService.activateAccount();
    // } else {
    //   this.error = true;
    // }
    //this.didShowErrorOnce = true;
  }

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

  goToDeposit() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'deposit'}}]);
      }, 50);
    });
  }
}
