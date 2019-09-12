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
    private errorService: ErrorService
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
          
          this.handleResetPassword(this.afAuth.auth, this.actionCode, this.mode);
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
      password: ['', [ Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25)]],      
      confirm: ['', Validators.required]
      },{
        validator: MustMatch('password', 'confirm')
    });
    this.onValueChanged()
    
  }
  
  handleResetPassword(auth, actionCode, mode) {
    axios.get(`https://grayll-app-bqqlgbdjbq-uc.a.run.app/api/v1/users/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .then(response => {              
      //this.registerForm.reset() 
      //this.content = 'Your account is verified. Now you can login!'
      //this.errorService.handleError(null, this.content) 
    })
    .catch( error => {
      console.log(error) 
      this.content = 'Link may be expired. Please try again!'
      //this.errorService.handleError(null, this.content)    
    });  
  }
  // handleResetPassword(auth, actionCode, mode) {
  //   // Localize the UI to the selected language as determined by the lang
  //   // parameter.
  //   var accountEmail;
  //   // Verify the password reset code is valid.
  //   auth.verifyPasswordResetCode(actionCode).then(email => {
  //     var accountEmail = email;
  
  //     // TODO: Show the reset screen with the user's email and ask the user for
  //     // the new password.
  
  //     // Save the new password.      
  //     //this.buildForm();
  //     //this.content = 'Your new password is set'
  //     this.errorService.handleError(null, this.content)
      
  //   }).catch(err =>  {
  //     // Invalid or expired action code. Ask user to try to reset the password
  //     // again.
  //   });
  // }
  
  // handleVerifyEmail(auth, actionCode, continueUrl, lang) {
  //   // Localize the UI to the selected language as determined by the lang
  //   // parameter.
  //   // Try to apply the email verification code.
  //   this.ngZone.run(() => {
  //     auth.applyActionCode(actionCode).then(resp => {
  //       // Email address has been verified.
    
  //       // TODO: Display a confirmation message to the user.
  //       // You could also provide the user with a link back to the app.
  //       //this.openEmailVerifyModal('Email Verification', 'Account was verified. Please login!', 'home/login')
  //       this.content = 'Your account is verified. Now you can login!'
  //       this.errorService.handleError(null, this.content)
        
  //       console.log('Your account is verified. Now you can login!')

  //       // Gennerate 
       
  //       //this.buildForm()
  //       // TODO: If a continue URL is available, display a button which on
  //       // click redirects the user back to the app via continueUrl with
  //       // additional state determined from that URL's parameters.
  //     }).catch(err => {
  //       // Code is invalid or expired. Ask the user to verify their email address
  //       // again.
  //       this.content = 'Link may be expired. Please verify again!'
  //       this.errorService.handleError(null, this.content)
  //       console.log(err)
  //     });
  //   })    
  // }
  handleVerifyEmail(auth, actionCode, mode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    axios.get(`https://grayll-app-bqqlgbdjbq-uc.a.run.app/api/v1/users/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .then(response => {              
      //this.registerForm.reset() 
      this.content = 'Your account is verified. Now you can login!'
      //this.errorService.handleError(null, this.content) 
    })
    .catch( error => {
      console.log(error) 
      this.content = 'Link may be expired. Please verify again!'
      //this.errorService.handleError(null, this.content)    
    });         
  }

  handleConfirmIp(auth, actionCode, mode) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    axios.get(`https://grayll-app-bqqlgbdjbq-uc.a.run.app/api/v1/users/validatecode?mode=${mode}&oobCode=${actionCode}`)             
    .then(response => {              
      //this.registerForm.reset() 
      this.content = 'Your account is verified. Now you can login!'
      //this.errorService.handleError(null, this.content) 
    })
    .catch( error => {
      console.log(error) 
      this.content = 'Link may be expired. Please verify again!'
      //this.errorService.handleError(null, this.content)    
    });         
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
    console.log('form invalid')
    if (this.handleForm.invalid) {        
        return;
    }
    this.ngZone.run(() => {
      this.afAuth.auth.confirmPasswordReset(this.actionCode, this.handleForm.value['password']).then(resp => {
        // Password reset has been confirmed and new password updated.
        this.message = 'New password is updated'
        console.log('message:', this.message)
        this.isUpdated = true

        // TODO: Display a link back to the app, or sign-in the user directly
        // if the page belongs to the same domain as the app:
        // auth.signInWithEmailAndPassword(accountEmail, newPassword);

        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
      }).catch(err =>  {
        // Error occurred during confirmation. The code might have expired or the
        // password is too weak.
        this.message = 'Can not reset password. Please try again later!'
        this.errorService.handleError(null, this.message)
      });
    })
    
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
      'pattern':       'Password must be include at one letter and one number.',
      'minlength':     'Password must be at least 4 characters long.',
      'maxlength':     'Password cannot be more than 25 characters long.'
    },
    'confirm': {
      'required':      'Password is required.',
      'mustMatch':     'Password must be matched.'     
    }
  };  

}
