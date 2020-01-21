
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { AngularFireAuth } from "angularfire2/auth";
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { createHash } from 'crypto';
import { UserInfo, Setting } from 'src/app/models/user.model';
import { AuthService } from '../shared/services/auth.service';


export interface UserMeta {UrWallet: 0, UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number}

  export interface AlgoMetric {GRYs: number; GRZs: number; GRYBl: number; GRZBl: number; TotalAccountBl: number; 
    TotalAccountProfit: number; TotalOpenPosition: number; PercentGRX: number;PercentXLM: number;GRXInUsd: number;XLMInUsd: number}

@Injectable({
  providedIn: 'root'
})
export class AlgoService {
  userData: any; // Save logged in user data
  _userMeta: Subject<UserMeta>
  userMeta:  Observable<UserMeta>
  userMetaStore:  UserMeta = {UrWallet: 0, UrGRY1: 0, UrGRY2: 0, UrGRY3: 0, UrGRZ: 0, UrGeneral: 0, OpenOrders: 0, OpenOrdersGRX: 0, 
  OpenOrdersXLM: 0, GRX: 0, XLM: 0}

  algoMetric: AlgoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
    TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
  
  constructor(    
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    public stellarService: StellarService,  
    private afs: AngularFirestore,   
    private authService: AuthService,   
  ) {    
   
  }

  getTotalAccountBl(){
      return this.authService.grxInUsd() + this.authService.xlmInUsd() + this.algoMetric.GRYBl + this.algoMetric.GRZBl
  }

  getUserMeta(){
    this._userMeta = new Subject<UserMeta>()
    this.userMeta = this._userMeta.asObservable()
    this.afs.doc<UserMeta>('users_meta/'+this.userData.Uid).valueChanges().subscribe(userMeta  => {
      console.log('userMeta:', userMeta)
      this.userMetaStore.UrGRY1 = userMeta.UrGRY1
      this.userMetaStore.UrGRY2 = userMeta.UrGRY2
      this.userMetaStore.UrGRY3 = userMeta.UrGRY3
      this.userMetaStore.UrGRZ= userMeta.UrGRZ
      this.userMetaStore.UrWallet = userMeta.UrWallet
      this.userMetaStore.UrGeneral = userMeta.UrGeneral
      console.log('this.userMetaStore:', this.userMetaStore)
      this._userMeta.next(userMeta)
    })
  }
}