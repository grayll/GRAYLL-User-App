import {Component, NgZone,Input, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
import { StellarService } from 'src/app/authorization/services/stellar-service'
import {SubSink} from 'subsink'
import { SwUpdate, SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { UserInfo, Setting } from 'src/app/models/user.model'
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {

  

  @Input() isGetAccountData: boolean;

  isNavbarCollapsed = false;
  faPowerOff = faPowerOff;
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faChartLine = faChartLine;

  walletNotices: number = 0
  algoNotices: number = 0
  generalNotices: number = 0 
  subsink:SubSink

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone:NgZone,
    public notificationsService: NotificationsService,
    public push: SwPush,
    public stellarService: StellarService,
    private http: HttpClient,
  ) {
    // Get basic data
    if (!this.authService.userInfo){
      this.http.post(`api/v1/users/getUserInfo`, {})
      .subscribe(res => {
        let data = (res as any)
        console.log('getUserInfo-userInfo:', data) 
        if (data.errCode == environment.SUCCESS){   
          let setting = new Setting(data.Setting.AppAlgo,
            data.Setting.AppGeneral,
            data.Setting.AppWallet,
            data.Setting.IpConfirm,
            data.Setting.MailAlgo,
            data.Setting.MailGeneral,
            data.Setting.MailWallet,
            data.Setting.MulSignature)     
          this.authService.userInfo = new UserInfo(data.Uid, data.EnSecretKey, data.SecretKeySalt, data.LoanPaidStatus, data.Tfa, data.Expire, setting)
        } else {
          console.log('getUserInfo-userInfo failed') 
        }     
      },
      e => {
        //re-try
        console.log(e)
        this.http.post(`api/v1/users/getUserInfo`, {})
        .subscribe(res => {
          let data = (res as any)
          let setting = new Setting(data.Setting.AppAlgo,
            data.Setting.AppGeneral,
            data.Setting.AppWallet,
            data.Setting.IpConfirm,
            data.Setting.MailAlgo,
            data.Setting.MailGeneral,
            data.Setting.MailWallet,
            data.Setting.MulSignature) 
          console.log('getUserInfo-userInfo:', data) 
          if (data.errCode == environment.SUCCESS){        
            this.authService.userInfo = new UserInfo(data.Uid, data.EnSecretKey, data.SecretKeySalt, data.LoanPaidStatus, data.TfaEnable, data.Expire, setting)
          } else {
            //this.errorService.handleError(null, `The request could not be performed! Please retry.`);
          }        
        },
        e => {
          console.log(e)        
        })
      })
    }

    this.subsink = new SubSink()    
    if (!this.authService.userData){
      console.log('NAV.GetLocalUserData()')
      this.authService.GetLocalUserData()
    }
    console.log('navbar.subscribe')
    //if (this.isGetAccountData){
      Promise.all([
        this.stellarService.getCurrentGrxPrice1(),
        this.stellarService.getCurrentXlmPrice1(),
        this.stellarService.getAccountBalance(this.authService.userData.PublicKey)
        .catch(err => {
          // Notify internet connection.
          //this.snotifyService.simple('Please check your internet connection.')
          console.log(err)
        })
      ])
      .then(([ grxPrice, xlmPrice, balances ]) => {         
        this.authService.userData.totalGRX = (balances as any).grx;
        this.authService.userData.totalXLM = (balances as any).xlm;
        this.authService.userData.xlmPrice = xlmPrice
        this.authService.userData.grxPrice = grxPrice
        this.authService.SetLocalUserData()
        console.log('NAV.this.authService.userData.xlmPrice:', this.authService.userData.xlmPrice)
        console.log('NAV.totalGRX:', this.authService.userData.totalGRX)
        console.log('NAV.totalXLM:', this.authService.userData.totalXLM)
        
      }) 
    //}

    this.subsink.add(push.messages.subscribe(msg => {
      let data = (msg as any).notification
      //console.log('navbar.subscribe-data1:', data)
      if (data.type === 'wallet'){
        console.log('navbar.UrWallet:', this.authService.userData.UrWallet)       
        this.authService.userData.UrWallet = +this.authService.userData.UrWallet + 1 
        console.log('navbar.UrWallet1:', this.authService.userData.UrWallet)       
        if (data.asset === 'XLM'){
          let amount = +data.amount
          this.authService.userData.totalXLM = (+this.authService.userData.totalXLM + amount).toFixed(7)
        } else if( data.asset === 'GRX' || data.asset === 'GRXT'){
          let amount = +data.amount
          console.log('navbar.amount:', data.amount)
          console.log('navbar.subscribe:totalGRX0:', this.authService.userData.totalGRX)
          this.authService.userData.totalGRX = (+this.authService.userData.totalGRX + amount).toFixed(7)
          console.log('navbar.subscribe:totalGRX1:', this.authService.userData.totalGRX)
        }            
      } else if (data.type === 'algo'){
        this.authService.userData.UrAlgo = +this.authService.userData.UrAlgo + 1
      } else if (data.type === 'general'){
        this.authService.userData.UrGeneral = +this.authService.userData.UrGeneral + 1
      }
      this.authService.SetLocalUserData() 
    }));
    
  }

  getAllUnreadNumber(){
    return (+this.authService.userData.UrAlgo + +this.authService.userData.UrWallet + +this.authService.userData.UrGeneral)
  }

  ngOnDestroy():void {
    this.subsink.unsubscribe()
  }

  signOut(){
    
    //this.authService.SignOut();
    // console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    // this.ngZone.run(()=>{
    //   //this.router.navigate(['/login'])
    // })
    console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    localStorage.removeItem('user');    
    this.authService.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
      // return this.firebaseAuth.auth.signOut().then(() => {
      //   console.log('SignOut')
      //   localStorage.removeItem('user');
      //   this.userData = null  
      // }).catch(err =>{
      //   console.log('Err:', err)
      // })
    })
  }

}
