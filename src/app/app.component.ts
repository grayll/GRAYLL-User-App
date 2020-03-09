import { Component } from '@angular/core';
import {SharedService} from './shared/shared.service';
import {SwPush} from "@angular/service-worker";
import {Router} from '@angular/router';
import { AlgoliaService } from './algolia.service';

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
    private router: Router,) {
      this.algolia.init();
    // this.swPush.notificationClicks.subscribe( noticeData =>
    //   {        
    //     const url = noticeData.notification.data.url
    //     // window.open(url, '_blank');
    //     // console.log('data.url: ' + url);
    //     //this.router.navigate(noticeData.notification.data.url)
    //     window.open(noticeData.notification.data.url, '_blank');
    //  });
  }

  // ngOnInit() {
  //   // Get the instance of the Intercom and insert the logged in user info, we will insert the user email
  //   // dynamically after we complete the user login or sign up flow.
  //   (<any>window).Intercom('boot', {
  //     email: 'xyz@gmail.com',
  //     });
  // }
}
