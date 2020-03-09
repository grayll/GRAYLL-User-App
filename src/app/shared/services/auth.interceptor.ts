import { Injectable, NgZone } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import { AuthService } from './auth.service';
import {PopupService} from '../../shared/popup/popup.service';
import { environment } from 'src/environments/environment';
import {SnotifyService} from 'ng-snotify';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private ngZone:NgZone,
      private router: Router,
      private authService: AuthService,
      public popupService: PopupService,
      private snotifyService: SnotifyService,
  ) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
    // If you are calling an outside domain then do not add the token.
    console.log(req.url)
    if (!req.url.includes('http')){
        req = req.clone({url : environment.api_url + req.url})
    }
    // Check token is expired
    if ((!req.url.includes('login') && !req.url.includes('register') && !req.url.includes('VerifyRecapchaToken')) 
      && this.authService.isTokenExpired()){
      console.log('Your login session has expired! Please login again.')
      this.snotifyService.simple('Your login session has expired! Please login again.');
      if (this.popupService.isOpen){
        this.popupService.closeAndRedirectTo('/login')
      } else {
        this.router.navigate(['/login'])
      }   
    }
    // if (!req.url.includes("users") ) {
    //     return next.handle(req);
    // }
    if (!req.url.includes("users") && !req.url.includes("grz") && !req.url.includes("gry")) {
      return next.handle(req);
    }
    console.log('add token', req.url)
    req = req.clone({
        setHeaders: {
            Authorization: `Bearer ${this.authService.userData.token}`
        }
    });
    //return next.handle(req)
    return next.handle(req).pipe( tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
          console.log('Catch exp:', err)         
        } else {
          if (this.popupService.isOpen){
            this.popupService.closeAndRedirectTo('/login')
          } else {
            this.router.navigate(['/login'])
          }     
        }   
      }
    }));
  }
}