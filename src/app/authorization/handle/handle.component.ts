import {Component,OnInit, NgZone} from '@angular/core';
import {faKey} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ErrorService} from '../../shared/error/error.service';
import { AuthService } from "../../shared/services/auth.service"
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
//import { ForgetpsdComponent } from '../forgetpsd/forgetpsd.component';
//import { EmailVerifyComponent } from '../email-verify/emailverify.component';
import { MustMatch } from '../services/helper/helper.service';
import axios from 'axios';
import * as tweetnacl from 'tweetnacl'
import {environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-handle',
  templateUrl: './handle.component.html',
  styleUrls: ['./handle.component.css']
})
export class HandleComponent implements OnInit {

  keyIcon  = faKey;
  handleForm: FormGroup;

  isUpdated = false;
  message: string;
  title: string;
   
  submitted: boolean=false;
  mode: string;
  actionCode: string;
  continueUrl: string;
  content: string;

  //get password() { return this.handleForm.get('password'); }
 // get confirm() { return this.handleForm.get('confirm'); }

  constructor(    
    public formBuilder:FormBuilder, private ngZone: NgZone,
    public authService: AuthService, private route: ActivatedRoute,
    private afAuth:AngularFireAuth,
    private errorService: ErrorService,
    private http: HttpClient,
  ) {
    this.buildForm();
    this.route.queryParams.subscribe(params => {
      // Get the action to complete.
      this.mode = params['mode'];
      // Get the one-time code from the query parameter.
      this.actionCode =  params['oobCode'];
      // (Optional) Get the continue URL from the query parameter if available.
      this.continueUrl =  params['continueUrl'];
      // (Optional) Get the language code if available.

      console.log('params:', params)

      // Handle the user management action.
      switch (this.mode) {
        case 'resetPassword':
          // Display reset password handler and UI.
          
          //this.handleResetPassword(this.afAuth.auth, this.actionCode, this.mode);
          break;
        case 'recoverEmail':
          // Display email recovery handler and UI.
          this.handleRecoverEmail(this.afAuth.auth, this.actionCode, this.mode);
          break;
        case 'verifyEmail':
        case 'confirmIp':
          // Display email verification handler and UI.
          this.title = 'Email verification'
          this.handleVerifyEmail(this.afAuth.auth, this.actionCode, this.mode);
          break;
        case 'changeEmail':
            // Display email verification handler and UI.
            this.title = 'Change Email'
            this.handleChangeEmail(this.actionCode, this.mode);
            break;
        default:
          // Error: invalid mode.
        }     
    });
  }

  private initForm() {
    this.handleForm = this.formBuilder.group({
      password: [null, Validators.required],
      confirm: [null, Validators.required]
    });
  }

  ngOnInit() {
    switch (this.mode) {
      case 'resetPassword':
        console.log('resetPassword-build form')
        //this.buildForm();
      break;
    }
  }
  buildForm(): void {
    this.handleForm = this.formBuilder.group({      
      password: ['', [ Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?])([0-9A-Za-z!@#$%^&*()_?+-=\[\]{};':"|,.<>\/?]+)$/),          
      Validators.minLength(8),
      Validators.maxLength(36)]],      
      confirm: ['', Validators.required]
      },{
        validator: MustMatch('password', 'confirm')
    });
    this.onValueChanged()
  }
  handleVerifyEmail(auth, actionCode, mode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    this.http.get(`api/v1/accounts/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .subscribe(response => {              
      //this.registerForm.reset() 
      this.content = 'Your account is verified. Now you can login to GRAYLL!'
      //this.errorService.handleError(null, this.content) 
    },
    error => {
      console.log(error) 
      this.content = 'Link may be expired. Please verify again!'
      //this.errorService.handleError(null, this.content)    
    })        
  }
  handleChangeEmail(actionCode, mode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    this.http.get(`api/v1/accounts/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .subscribe(
      res => {              
        //this.registerForm.reset() 
        this.content = 'Your new email is confirmed. Please login to new email to verify!'        
      },
      error => {
        console.log(error) 
        this.content = 'Link may be expired. Please verify again!'
        //this.errorService.handleError(null, this.content)    
      }    
    )            
  }
  handleConfirmIp(auth, actionCode, mode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    this.http.get(`api/v1/accounts/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .subscribe(res => {              
      //this.registerForm.reset() 
      this.content = 'Your account is verified. Now you can login to GRAYLL.'
      //this.errorService.handleError(null, this.content) 
      },
      error => {
        console.log(error) 
        this.content = 'Link may be expired. Please verify again!'
        //this.errorService.handleError(null, this.content)    
      }
    )
            
  }

  handleRecoverEmail(auth, actionCode, lang) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    var restoredEmail = null;
    // Confirm the action code is valid.
    auth.checkActionCode(actionCode).then(info => {
      // Get the restored email address.
      restoredEmail = info['data']['email'];
  
      // Revert to the old email.
      return auth.applyActionCode(actionCode);
    }).then(()=> {
      // Account email reverted to restoredEmail
  
      // TODO: Display a confirmation message to the user.
  
      // You might also want to give the user the option to reset their password
      // in case the account was compromised:
      auth.sendPasswordResetEmail(restoredEmail).then(() => {
        // Password reset confirmation sent. Ask user to check their email.
      }).catch(err => {
        // Error encountered while sending password reset code.
      });
    }).catch(err => {
      // Invalid code.
    });
  }
  submitClicked() {
    // if (this.submitted){
    //   return
    // }
    this.submitted = true;
    if (this.isUpdated){
      return
    }
    this.onValueChanged()
    // stop here if form is invalid
    
    if (this.handleForm.invalid) {        
        return;
    }
    //this.ngZone.run(() => {
      this.http.post(`api/v1/accounts/resetpassword`, 
        { oobCode: this.actionCode, newPassword:this.handleForm.value['password']})             
      .subscribe(res => {  
        if ((res as any).errCode == environment.SUCCESS)  {
          this.message = "Your password has been reset successfully."
          this.errorService.handleError(null, this.message)
          this.handleForm.reset() 
        } else if((res as any).errCode == environment.EMAIL_NOT_EXIST ){
          this.message = "The email does not exist."
          this.errorService.handleError(null, this.message)
          this.handleForm.reset() 
        } else if((res as any).errCode == environment.INVALID_CODE ){
            this.message = "The reset password token is invalid."
            this.errorService.handleError(null, this.message)
            this.handleForm.reset()        
        } else {   
          this.handleForm.reset()  
          this.message = 'Can not reset password right now. Please try again later!'
          this.errorService.handleError(null, this.message);
        }
      },
      error => {
        console.log(error)               
        this.message = 'Can not reset password right now. Please try again later!'
        this.errorService.handleError(null, this.message);
      })      
    //})    
  }

  get f() { return this.handleForm.controls; }

 
  // Updates validation state on form changes.
  onValueChanged(data?: any) {
    if (!this.handleForm) { return; }
    const form = this.handleForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);    
      //console.log('control:', control)  
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
    'confirm': ''
  };

  validationMessages = {    
    'password': {
      'required':      'Password is required.',
      'pattern':       'Password must include at least one letter, one number, one capital and one special character.',
      'minlength':     'Password must be at least 8 characters long.',
      'maxlength':     'Password cannot be more than 36 characters long.'
    },
    'confirm': {
      'required':      'Password is required.',
      'mustMatch':     'Password must be matched.'     
    }
  };  

}
