import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {PopupService} from '../popup.service';
import {ErrorService} from '../../error/error.service';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import {AuthService} from 'src/app/shared/services/auth.service';
import { HttpClient } from  '@angular/common/http';
import { environment } from 'src/environments/environment';
import {SnotifyService} from 'ng-snotify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-pw',
  templateUrl: './confirm-pw.html',
  styleUrls: ['./confirm-pw.css']
})
export class ConfirmPasswordComponent implements OnInit {

  @ViewChild('content') modal; 
  password: string = '';
  faCode: string = '';
  remainingTime: string
  x:any
  
  constructor(
    public popupService: PopupService,    
    private errorService: ErrorService,
    private ngZone:NgZone,
    private authService: AuthService,    
    private http: HttpClient,
    private router: Router,
  ) {    
    
    //this.remainingTime = '5:00'
    this.x = setInterval(()=> {

      // Get today's date and time
      var now = new Date().getTime();    
      // Find the distance between now and the count down date
      var distance = this.authService.userMetaStore.TokenExpiredTime*1000 - now;
    
      // Time calculations for days, hours, minutes and seconds
      // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      // var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);   
     
      this.remainingTime = minutes + "m - " + seconds + "s "; 
    
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(this.x); 
        this.popupService.close().then(()=>{
          this.signOut()
        })       
      }
    }, 1000);
    //this.scheduleCheckTokenExpiry()
  }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.password = ''
  }
  signOut(){       
    localStorage.removeItem('grayll-user');    
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
    })
  }
  submit() {    
    this.errorService.clearError();   
    if (!this.clientValidation()){
      return
    }
    
    if (this.authService.userInfo.Tfa){
      // Verify 2FA code
      this.authService.verifyTfaAuth(this.faCode, this.password, -2).subscribe(         
        res => {                 
          if ((res as any).errCode === environment.SUCCESS ){                 
            this.renewToken()                    
          } else {        
            switch ((res as any).errCode){
              case environment.TOKEN_INVALID:
                this.errorService.handleError(null, 'The 2FA code from your Authenticator App is invalid! Please retry.')
                break;              
              default:
                this.errorService.handleError(null, `The request could not be performed! Please retry.`)
                break;
            }       
          }     
        },
        err => {
          this.errorService.handleError(null, 'The 2FA code from your Authenticator App is invalid! Please retry.')
        })        
    } else {
      this.authService.GetSecretKey(this.password).then(SecKey => {
        if (SecKey != ''){
          // send request api for re-new token
          this.renewToken()            
        } else {       
          this.errorService.handleError(null, 'Please enter the valid password!');
        }
      })
    }
   
  }

  renewToken(){
    this.http.post("api/v1/users/Renew", {}).subscribe(
      res => {            
        let data =  (res as any)             
        if (data.errCode === environment.SUCCESS) {
          this.authService.userData.token = data.token
          this.authService.userMetaStore.TokenExpiredTime = data.tokenExpiredTime
          //this.authService.SetLocalUserData()          
          this.popupService.close()
        } else {              
          this.errorService.handleError(null, 'Please enter the valid password!');
        }
        if(this.x){
          clearInterval(this.x);
        }
      },
      err => {           
        this.errorService.handleError(null, 'Your renew token may be expired, please signout and login again.');
      }
    )  
  }

  clientValidation(): boolean {  
    if (this.authService.userInfo.Tfa) {
      if (!this.faCode || this.faCode === '' || this.faCode.length != 6) { 
        this.errorService.handleError(null, 'Please enter the valid two FA code!');
        return false
      }
    } else {
      if (!this.password || this.password === '') {
        this.errorService.handleError(null, 'Please enter the valid password!');
        return false;
      }
    }    
    return true;
  }

  // scheduleCheckTokenExpiry(){ 
  //   // Schedule to logout
  //   let logoutTime = this.authService.userMetaStore.TokenExpiredTime*1000 - (new Date().getTime())
  //   console.log('confirmpwd-remaining time for logoutTime:', logoutTime)
  //   if (logoutTime >= 0){
  //     setTimeout(()=> {
  //       //will renew the token
  //       if (this.authService.isTokenExpired){
  //         console.log('confirmpwd-token is expired, closed ')
  //         this.popupService.close()
  //       } else {
  //         console.log('token already renew')
  //       }          
  //     }, logoutTime)
  //   }
  // }
}
