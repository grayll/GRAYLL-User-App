
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { StellarService } from 'src/app/authorization/services/stellar-service';
import {SubSink} from 'subsink'
import { AlgoService } from 'src/app/system/algo.service';
import { AuthService } from './auth.service';
import { NoticeDataService } from 'src/app/notifications/notifications.dataservice';
import { ReferralService } from 'src/app/referral/referral.service';
import { SnotifyService } from 'ng-snotify';

@Injectable({
    providedIn: 'root' 
  })
  export class LogoutService {
    public isSignout: boolean = false
    public subsink: SubSink = new SubSink()
    constructor(    
        
        public stellarService: StellarService,  
        public algoService: AlgoService,
        public authService: AuthService,
        public noticeService : NoticeDataService,
        public refService: ReferralService, 
        public ngZone: NgZone,     
        public router: Router,
        private snotifyService: SnotifyService,
      ) { 
    }
    signOut(){  
    this.isSignout = true
    //console.log('NAV-signout')   
    this.subsink.unsubscribe()
    if (this.authService.subsink){
        this.authService.subsink.unsubscribe()
    }
    this.authService.isSubPrice = false
    this.authService.isSubUserMeta = false

    // if (this.authService.userMetaStore.OpenOrders > 0){
    //     this.authService.updateUserMeta()
    // }
    clearTimeout(this.authService.timeOutShowConfirmPwd)
    clearTimeout(this.authService.timeOutLogout)
    
    this.algoService.resetServiceData()
    this.authService.resetServiceData()
    this.stellarService.resetServiceData()
    this.noticeService.resetServiceData()
    this.refService.resetData()
    localStorage.removeItem('grayll-user');    
    localStorage.removeItem('grayll-user-meta');   
    this.ngZone.run(() => {
        //console.log('signout-home')
        this.router.navigate(['']);      
    });
    }

    private _loading: boolean = false;
    get loading(){
        return this._loading;
    }
    
    show(msg){
        this._loading = true;
        let newmsg = "The GRAYLL App is currently under maintenance, we will email you when the App is available again."
        if (msg){
            newmsg = msg
        } 
        
        this.snotifyService.warning(newmsg, {
            timeout: -1,
            showProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true
          });        
    }

    hide(){
        this.snotifyService.clear()
        this._loading = false;
    }
  }