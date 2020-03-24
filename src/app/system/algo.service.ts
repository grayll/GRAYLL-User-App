
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
import { ClosePosition } from './algo-position.model';


export interface UserMeta {UrWallet: 0, UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number}

export interface AlgoMetric {GRYs: number; GRZs: number; GRYBl: number; GRZBl: number; TotalAccountBl: number; 
  TotalAccountProfit: number; TotalOpenPosition: number; PercentGRX: number;PercentXLM: number;GRXInUsd: number;XLMInUsd: number}

export interface AlgoMetrics {Positions: number; CurrentProfit: number; TotalValue: number; OneDayPercent:number; SevenDayPercent:number; ROI:number;
                              OneDayCnt: number; SevenDayCnt: number }


@Injectable({
  providedIn: 'root'
})
export class AlgoService {
  
  algoMetric: AlgoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
    TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
  
  grzMetric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROI:0, OneDayCnt:0, SevenDayCnt:0}
  gry1Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROI:0, OneDayCnt:0, SevenDayCnt:0}
  gry2Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROI:0, OneDayCnt:0, SevenDayCnt:0}
  gry3Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROI:0, OneDayCnt:0, SevenDayCnt:0}

  public fsdb:any

  allPositions: ClosePosition[] = []
  openPositions: ClosePosition[] = []
  closePositions: ClosePosition[] = []
  closeGrayllId: string
  closeAll: boolean

  public algoPositions$: Observable<ClosePosition[]>;
  algoPositionCollection: AngularFirestoreCollection<ClosePosition>;

  noticeId:string
  
  constructor(    
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    public stellarService: StellarService,  
    private afs: AngularFirestore,   
    private authService: AuthService,   
  ) {    
    this.algoPositionCollection = afs.collection<ClosePosition>('algo_positions/users/'+this.authService.userData.Uid);
    this.algoPositions$ = this.algoPositionCollection.valueChanges();
  
  }

  // initFireStoreDb(){    
  //   if (!this.fsdb){
  //     var app = firebase.initializeApp(environment.dbs.systemtest, 'grayll-system-test');
  //     this.fsdb = firebase.firestore(app);
  //   }
  // }

  getAlgoPositions(){
    let algoPostionPath = 'algo_positions/GRZ/algo_positions_open/'
    if(this.fsdb){
      this.fsdb.collection(algoPostionPath).onSnapshot(snapshot => {      
        snapshot.docChanges().forEach( change => {
          console.log("New: ", change.doc.data());
          // if (change.type === "added") {
          //     console.log("New: ", change.doc.data());
          // }
          // if (change.type === "modified") {
          //     console.log("Modified: ", change.doc.data());
          // }
          // if (change.type === "removed") {
          //     console.log("Removed: ", change.doc.data());
          // }
        });
      })
    }
  }

  getTotalAccountBl(){
      return this.authService.grxInUsd() + this.authService.xlmInUsd() + this.algoMetric.GRYBl + this.algoMetric.GRZBl
  }

  get algoPositions(){
    return this.algoPositions$;
  }

  
  
  

}