import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ErrorService} from './shared/error/error.service';
import {NotFoundComponent} from './shared/not-found/not-found.component';
import {ErrorPageComponent} from './shared/error-page/error-page.component';
import {SnotifyModule, SnotifyService} from 'ng-snotify';
import {NotifierConfig} from './shared/configurations/snotify.conf';
import {SharedModule} from './shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Firebase services + enviorment module
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
// Recaptcha
import { NgxPasswordToggleModule } from 'ngx-password-toggle';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

// Auth service
import { AuthService } from "./shared/services/auth.service";
import { environment } from 'src/environments/environment';

//import { LoginComponent } from './authorization/login/login.component';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { StellarService } from './authorization/services/stellar-service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxUiLoaderModule } from  'ngx-ui-loader';

declare var Hammer: any;

export class MyHammerConfig extends HammerGestureConfig  {
  buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, {
      touchAction: 'pan-y'
    });
    return mc;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ErrorPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    SnotifyModule,
    NgbModule,

    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    RecaptchaV3Module,
    NgxPasswordToggleModule,
    NgxUiLoaderModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),   
  ],
  providers: [
    ErrorService, AuthService, StellarService,
    { provide: 'SnotifyToastConfig', useValue: NotifierConfig},
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LfYI7EUAAAAAGYF0RFiE6p28pfDCkXFXE1REW0w' },
    SnotifyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
