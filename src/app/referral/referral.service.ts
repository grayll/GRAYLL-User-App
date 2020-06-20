import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { AngularFireAuth } from "angularfire2/auth";
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { createHash } from 'crypto';
import { UserInfo, Setting } from 'src/app/models/user.model';
import { AuthService } from '../shared/services/auth.service';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from '@angular/fire/database';
import { environment } from 'src/environments/environment';

import { map } from 'rxjs/operators';

export interface ReferralMetrics {totalFeeUsd: number; totalFeeGRX: number; totalPayment: number; confirmed:number; pending:number;}

export interface Contact {name: string; lname: string; email: string; phone:string; businessName:string;}

export interface Referral extends Contact { totalFeeGRX:number; totalFeeUsd: number; totalPayment: number; time:number}

export interface ReferralTx extends Contact { feeGRX:number; feeUsd: number; stellarTx: string; time:number}
export interface Invite extends Contact { remindTime:number; lastSentRemind: number;}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {

    _referer: Observable<any>
    _metric: Observable<any>
    _referralContacts: Observable<any>
    _referralTxs: Observable<any>
    _invites: Observable<any>

    public metric: ReferralMetrics = {totalFeeUsd: 0, totalFeeGRX: 0, totalPayment: 0, confirmed:0, pending:0}

    public referralContacts: Referral[]
    public referralTxs: ReferralTx[]
    public referer: Referral
    public invites: Invite[]

    constructor(    
        public router: Router,  
        public ngZone: NgZone, // NgZone service to remove outside scope warning
        public http: HttpClient,
        public stellarService: StellarService,  
        private afs: AngularFirestore,   
        private authService: AuthService,   
    ) {
        this.metric = {totalFeeUsd: 0, totalFeeGRX: 0, totalPayment: 0, confirmed:0, pending:0}
        this.referralContacts = []
        this.referralTxs = []
        this.invites = []
       // this.referer       
    }

    subReferral(){
        let uid = this.authService.userData.Uid
        if (!this._metric){
            this._metric = this.afs.doc('referrals/' + uid + '/metrics/referral').valueChanges()
        }

        if (!this._referer){
            this._referer = this.afs.collection('referrals/' + uid + '/referer').valueChanges()
        }
        if (!this._referralContacts){
            // need to change refererral to referral after test completion
            this._referralContacts = this.afs.collection('referrals/' + uid + '/referral').valueChanges()
        }

        if (!this._referralTxs){
            this._referralTxs = this.afs.collection('referrals/' + uid + '/txs').valueChanges()
        }
        if (!this._invites){
            this._invites = this.afs.collection('referrals/' + uid + '/invite').valueChanges()
        }
    }

   

}