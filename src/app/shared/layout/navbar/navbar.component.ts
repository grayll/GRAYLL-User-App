import {Component, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {faBell, faChartBar, faChartLine, faCommentAlt, faPowerOff, faSearch, faUser, faWallet} from '@fortawesome/free-solid-svg-icons';
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
  faSearch = faSearch;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone:NgZone,
  ) { }

  signOut(){
    this.authService.SignOut();
    console.log('GetLocalUserData:', this.authService.GetLocalUserData())
    this.ngZone.run(()=>{
      //this.router.navigate(['/login'])
    })
  }

}
