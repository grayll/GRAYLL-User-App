import { Component } from '@angular/core';
import {SharedService} from './shared/shared.service';
import {SwPush, SwUpdate} from "@angular/service-worker";
import {Router} from '@angular/router';
import { AlgoliaService } from './algolia.service';
import { SwUpdateNotifyService } from './shared/sw-update-notifiy/sw-update-notify.service';
import { interval } from 'rxjs';
import { AdminService } from './admin/admin.service';
import { LoadingService } from './shared/services/loading.service';
import { SnotifyService } from 'ng-snotify';
import { LogoutService } from './shared/services/logout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //https://stackoverflow.com/questions/54138763/open-pwa-when-clicking-on-push-notification-handled-by-service-worker-ng7-andr
  // In angular 7 (specifically referring to "@angular/service-worker" v~7.2.0), after you build your app with ng build --prod,
  // examine your /dist folder and look for the file ngsw-worker.js. Open it in an editor.
  // On line 1885, you will find:
  // this.scope.addEventListener('notificationclick', (event) => this.onClick(event));
  // Change it to:
  // this.scope.addEventListener('notificationclick', (event) => {
  //     event.notification.close();
  //     if (clients.openWindow && event.notification.data.url) {
  //         event.waitUntil(clients.openWindow(event.notification.data.url));
  //     }
  // });
  constructor(public sharedService: SharedService, private algolia: AlgoliaService,
    private swPush: SwPush,
    private loadingService: LoadingService,
    public updates: SwUpdate,
    public adminService: AdminService,
    public swService: SwUpdateNotifyService,
    private snotifyService: SnotifyService,
    private logoutService:LogoutService,
    ) {
      if (!this.adminService.adminSetting.loginStatus){        
        this.logoutService.signOut()  
        console.log('showloading screen')
        this.logoutService.show('')
      } else {
        this.logoutService.hide()
      }
      
      this.adminService.subAdminSetting()
      this.adminService._adminSetting.subscribe(setting => {
        console.log('setting:', setting)
        if (setting){
          this.adminService.adminSetting = setting
          if (!this.adminService.adminSetting.loginStatus){                        
            this.logoutService.show('')
            this.logoutService.signOut()           
          } else {
            this.logoutService.hide()
          }          
        }
      })
      this.algolia.init();
      this.checkForUpdates(true)
   
  }

  // ngOnInit() {
  //   // Get the instance of the Intercom and insert the logged in user info, we will insert the user email
  //   // dynamically after we complete the user login or sign up flow.
  //   (<any>window).Intercom('boot', {
  //     email: 'xyz@gmail.com',
  //     });
  // }

  checkForUpdates(isFirstCheck: boolean): void {
    //console.log('checkForUpdates()');
    this.updates.available.subscribe(event => 
    {
      this.swService.show()
    });
    if (this.updates.isEnabled) {
        // Required to enable updates on Windows and ios.
        this.updates.activateUpdate();
        if (isFirstCheck){
          this.updates.checkForUpdate().then(() => {
            //console.log('Checking for updates');
          });
        } 
        interval(1 * 60 * 1000).subscribe(() => {
          //console.log('run interval 2 minutes');
          this.updates.checkForUpdate().then(() => {
              //console.log('3Checking for update');
          });
        });
    }
    // Important: on Safari (ios) Heroku doesn't auto redirect links to their https which allows the installation of the pwa like usual
    // but it deactivates the swUpdate. So make sure to open your pwa on safari like so: https://example.com then (install/add to home)
  }
}
