import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../popup.service';
import {Router} from '@angular/router';
import {UserService} from '../../../authorization/user.service';
import { AuthService } from "../../../shared/services/auth.service"
import { User, Setting } from "../../../shared/services/user";
import { StellarService } from '../../../authorization/services/stellar-service';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ErrorService} from '../../../shared/error/error.service';
import {ClipboardService} from 'ngx-clipboard';
import {SnotifyService} from 'ng-snotify';
import axios from 'axios';
import { environment } from 'src/environments/environment';
const bip39 = require('bip39')
var naclutil = require('tweetnacl-util');


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
  
  isSecretKeyRevealed: boolean;
  secretKey: string;
  password: string;
  seed: string;
  firstPopup: boolean;
  hideCloseButton: boolean;
  displayFinalLayOffLoanPopup: boolean;
  canGoToDeposit: boolean;
  onCloseRedirectTo: string;

  constructor(
    private popupService: PopupService,
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private stellarService: StellarService,
    private formBuilder: FormBuilder,
    private errorService: ErrorService,
    private clipboardService: ClipboardService,
    private snotifyService: SnotifyService
  ) { 
  
    this.firstPopup = true;
    this.secretKey = '';
    this.seed = '';
    this.onCloseRedirectTo = '/login';
  }

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
    //if (this.clientValidation()) {
	    this.errorService.clearError();
	    this.onValueChanged()
	    //if (this.didShowErrorOnce) {
	      this.error = false;
	      this.success = true;
	      //let pair = this.stellarService.generateKeyPair();
      
        this.stellarService.makeSeedAndRecoveryPhrase(this.authService.userData.Uid, res => {
          console.log('phrase:', res.recoveryPhrase)
            this.stellarService.encryptSecretKey(this.frm.value['password'], res.keypair.rawSecretKey(), (enSecret) => { 
              let data = {password:this.frm.value['password'], publicKey: res.keypair.publicKey(), 
                enSecretKey:enSecret.EnSecretKey, salt: enSecret.Salt}
            
              this.stellarService.recoverKeypairFromPhrase(this.authService.userData.Uid, res.recoveryPhrase, (kp)=> {
                console.log('recover secret:', kp.secret())
                console.log('recover pubkey:', kp.publicKey())
              })

	          axios.post(`${environment.api_url}api/v1/users/validateaccount`, data,
	          { headers: { Authorization:'Bearer ' + this.authService.userData.token}}).then(resp => {
	            console.log(resp)
	            if (resp.data.errCode === environment.SUCCESS){

                this.stellarService.trustAsset(res.keypair.secret()).then( ()=> {
                  this.hideCloseButton = true;
                  this.firstPopup = false;
                  this.secretKey = res.keypair.secret()
                  this.seed = res.recoveryPhrase
                }).catch(err => {
                  this.error = true;
                })               
	            }
	          }).catch(err => {
              console.log(err)
              this.error = true;
	          })
	        })       
	      })
     
	      //this.userService.activateAccount();
	    // } else {
	    //   this.error = true;
	    // }
	    //this.didShowErrorOnce = true;
	  }  
  //}

  retry() {
    this.error = false;
    this.success = false;
    this.didShowErrorOnce = true;
  }

  copySecretKey() {
    if (this.clipboardService.copyFromContent(this.secretKey)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  copySeed() {
    if (this.clipboardService.copyFromContent(this.seed)) {
      this.snotifyService.simple('Copied to clipboard.');
    }
  }

  displayLoan() {
    this.displayFinalLayOffLoanPopup = true;
    this.canGoToDeposit = true;
    this.error = false;
    this.success = false;
    this.hideCloseButton = false;
    this.onCloseRedirectTo = '/dashboard/overview';
  }
  goToDeposit() {
    this.popupService.close().then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'deposit'}}]);
      }, 200);
    });
  }
}
  
// clientValidation(): boolean {
//     if (!this.password || (this.password && this.password === '')) {
//       this.errorService.handleError(null, 'You must enter a password to activate your GRAYLL account.');
//       return false;
//     }
//     return true;
//   }
// }
