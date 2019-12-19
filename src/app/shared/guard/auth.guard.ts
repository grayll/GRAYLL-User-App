import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from "../../shared/services/auth.service";
import { Observable } from 'rxjs';
import {SnotifyService} from 'ng-snotify';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {  
  constructor(
    public authService: AuthService,
    public router: Router,
    private snotifyService: SnotifyService,
  ){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isTokenExpired()){
      this.snotifyService.simple('Your login session has expired! Please login again.')
      this.router.navigate(['/login'])
      return false
    }
    if(!this.authService.GetLocalUserData()) {
      console.log("authService.isLoggedIn:false")
      this.router.navigate(['/login'])
    }
    return true;
  }

}