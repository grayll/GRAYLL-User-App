import {Component, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
import {NotificationsService} from '../../../notifications/notifications.service';
import {AuthService} from 'src/app/shared/services/auth.service'
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  isNavbarCollapsed = false;
  faPowerOff = faPowerOff;
  faUser = faUser;
  faBell = faBell;
  faComment = faCommentAlt;
  faChartBar = faChartBar;
  faWallet = faWallet;
  faChartLine = faChartLine;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone:NgZone,
    public notificationsService: NotificationsService,
  ) { }

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
