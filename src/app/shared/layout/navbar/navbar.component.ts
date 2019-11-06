import {Component, NgZone, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
import {SubSink} from 'subsink'
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {

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
  ) { 
    this.subsink = new SubSink()
    // if (this.authService.userData){
    //   console.log('this.authService.userData.UrWallet: ', this.authService.userData.UrWallet)
    //   this.walletNotices = this.authService.userData.UrWallet
    //   this.algoNotices = this.authService.userData.UrAlgo
    //   this.generalNotices = this.authService.userData.UrGeneral
    // } 
    this.subsink.add(this.notificationsService.subsNumberNotices().subscribe(numberNotices => {
      // numberNotice number could be -/+
      if (!this.authService.userData){
        this.authService.GetLocalUserData()
      }
      if (this.walletNotices + numberNotices[0] >= 0){
        this.walletNotices = this.walletNotices + numberNotices[0]        
        this.authService.userData.UrWallet = this.walletNotices
      }
      if (this.algoNotices + numberNotices[1] >= 0){
        this.algoNotices = this.algoNotices + numberNotices[1]
        this.authService.userData.UrAlgo = this.algoNotices
      }
      if (this.generalNotices + numberNotices[2] >= 0){
        this.generalNotices = this.generalNotices + numberNotices[2]
        this.authService.userData.UrGeneral = this.generalNotices
      }
    }))
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
