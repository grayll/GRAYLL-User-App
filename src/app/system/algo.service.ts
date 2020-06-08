
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
import { map } from 'rxjs/operators';


export interface UserMeta {UrWallet: 0, UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number}

export interface AlgoMetric {GRYs: number; GRZs: number; GRYBl: number; GRZBl: number; TotalAccountBl: number; 
  TotalAccountProfit: number; TotalOpenPosition: number; PercentGRX: number;PercentXLM: number;GRXInUsd: number;XLMInUsd: number}

export interface AlgoMetrics {Positions: number; CurrentProfit: number; TotalValue: number; OneDayPercent:number; SevenDayPercent:number; ROIPercent:number;
                              OneDayCnt: number; SevenDayCnt: number }


@Injectable({
  providedIn: 'root'
})
export class AlgoService {
  
  algoMetric: AlgoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
    TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
  
  grzMetric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  gry1Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  gry2Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  gry3Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
  gryMetric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}

  public fsdb:any

  allPositions: ClosePosition[] = []
  openPositions: ClosePosition[] = []
  closePositions: ClosePosition[] = []
  closeGrayllId: string
  closeAll: boolean
  closingAllAlgo: string = ''

  public algoPositions$: Observable<ClosePosition[]>;
  algoPositionCollection: AngularFirestoreCollection<ClosePosition>;

  openAlgos$:Observable<ClosePosition[]>;

  noticeId:string
  
  constructor(    
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    public stellarService: StellarService,  
    private afs: AngularFirestore,   
    private authService: AuthService,   
  ) {    
    // this.algoPositionCollection = afs.collection<ClosePosition>('algo_positions/users/'+this.authService.userData.Uid);
    // this.algoPositions$ = this.algoPositionCollection.valueChanges();
  
  }

  subsAlgoPositions(){
    this.algoPositionCollection = this.afs.collection<ClosePosition>('algo_positions/users/'+this.authService.userData.Uid);
    this.algoPositions$ = this.algoPositionCollection.valueChanges();
  }

  resetServiceData(){
    this.algoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
      TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
      this.grzMetric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.gry1Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.gry2Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
      this.gry3Metric = {Positions:0, CurrentProfit:0, TotalValue:0, OneDayPercent:0, SevenDayPercent:0, ROIPercent:0, OneDayCnt:0, SevenDayCnt:0}
    this.allPositions  = []
    this.openPositions  = []
    this.closePositions = []
    this.closeGrayllId = null
    this.closeAll = false
    
    this.algoPositions$ = null
    this.algoPositionCollection = null    
    this.noticeId = null
  }
  
  getCollection(ref, queryFn?): Observable<any[]> {   
    return this.afs.collection(ref, queryFn).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        //const data = a.payload.doc.data();
        const data = a.payload.doc.data() as ClosePosition;
        return data    
      }))
    );
  }
  subOpenAlgos() {
    let path = 'algo_positions/users/'+this.authService.userData.Uid
    this.openAlgos$ = this.getCollection(path, ref => ref 
      .where('status', '==', 'OPEN'))
  }

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
      return this.authService.grxInUsd() + this.authService.xlmInUsd() + this.authService.userMetaStore.total_grz_current_position_value_$
       + this.authService.userMetaStore.total_gry1_current_position_value_$ + this.authService.userMetaStore.total_gry2_current_position_value_$
       + this.authService.userMetaStore.total_gry3_current_position_value_$ 
  }

  getTotalProfit(){
    return this.authService.userMetaStore.total_gry1_current_position_ROI_$ + this.authService.userMetaStore.total_gry1_close_positions_ROI_$ +
    this.authService.userMetaStore.total_gry2_current_position_ROI_$ + this.authService.userMetaStore.total_gry2_close_positions_ROI_$+
    this.authService.userMetaStore.total_gry3_current_position_ROI_$ + this.authService.userMetaStore.total_gry3_close_positions_ROI_$+
    this.authService.userMetaStore.total_grz_current_position_ROI_$ + this.authService.userMetaStore.total_grz_close_positions_ROI_$
  }

  get algoPositions(){
    return this.algoPositions$;
  }
  getTotalAccountValue(){
    return this.authService.xlmInUsd() + this.authService.grxInUsd() + this.getAlgoBalance()
  }
  // getGRYBalance(){
  //   return this.gry1Metric.TotalValue + this.gry2Metric.TotalValue + this.gry3Metric.TotalValue
  // }
  // getAlgoBalance(){   
  //   return this.getGRYBalance() + this.grzMetric.TotalValue
  // }
  
  // calPercentGRY(){
  //   // let totalgry = this.getGRYBalance()
  //   // if (this.userMetaStore.total_grz_current_position_value_$ == 0 && totalgry == 0){
  //   //   return 0
  //   // } else {
  //   //   return Math.round(totalgry*100/(totalgry + this.userMetaStore.total_grz_current_position_value_$))
  //   // }
  //   let totalgry = this.getGRYBalance()
  //   if (this.grzMetric.TotalValue == 0 && totalgry == 0){
  //     return 0
  //   } else {
  //     return Math.round(totalgry*100/(totalgry + (this.grzMetric.TotalValue | 0)))
  //   }

  // }
  // calPercentGRZ(){
  //   let totalgry = this.getGRYBalance()
  //   // if (this.userMetaStore.total_grz_current_position_value_$ == 0 && totalgry == 0){
  //   //   return 0
  //   // } else {
  //   //   return 100 - this.calPercentGRY()
  //   // }
  //   if (this.grzMetric.TotalValue == 0 && totalgry == 0){
  //     return 0
  //   } else {
  //     return 100 - this.calPercentGRY()
  //   }
  // }
  // getTotalOpenPosition(){
  //   // return this.userMetaStore.total_gry1_open_positions + this.userMetaStore.total_gry2_open_positions + 
  //   // this.userMetaStore.total_gry3_open_positions + this.userMetaStore.total_grz_open_positions
  //   this.grzMetric.Positions + this.gry1Metric.Positions + 
  //   this.gry2Metric.Positions + this.gry3Metric.Positions
  // }
  // getGRYProfit(){
  //  return this.gry1Metric.CurrentProfit + 
  //   this.gry2Metric.CurrentProfit + this.gry3Metric.CurrentProfit
  // }
  // getTotalAccountProfit(){
  //   //return this.getGRYProfit() + this.userMetaStore.total_grz_close_positions_ROI_$ + this.userMetaStore.total_grz_current_position_ROI_$
  //   let ret = this.grzMetric.CurrentProfit + this.getGRYProfit() + this.authService.userMetaStore.total_grz_close_positions_ROI_$ + 
  //   this.authService.userMetaStore.total_gry1_close_positions_ROI_$ +this.authService.userMetaStore.total_gry2_close_positions_ROI_$ +
  //   this.authService.userMetaStore.total_gry3_close_positions_ROI_$ 

  //   return ret
  // }

  getGRYBalance(){
    return this.authService.userMetaStore.total_gry1_current_position_value_$ + this.authService.userMetaStore.total_gry2_current_position_value_$ + 
    this.authService.userMetaStore.total_gry3_current_position_value_$
    // if (this.algoService.gry1Metric && this.algoService.gry2Metric && this.algoService.gry3Metric ){
    //   return this.algoService.gry1Metric.TotalValue + this.algoService.gry2Metric.TotalValue + this.algoService.gry3Metric.TotalValue
    // }
    // return 0
  }
  getAlgoBalance(){
    return this.getGRYBalance() + this.authService.userMetaStore.total_grz_current_position_value_$
    //return this.getGRYBalance() + (this.algoService.grzMetric.TotalValue | 0)
  }
  calPercentGRY(){
    let totalgry = this.getGRYBalance()
    if (this.authService.userMetaStore.total_grz_current_position_value_$ == 0 && totalgry == 0){
      return 0
    } else {
      return Math.round(totalgry*100/(totalgry + this.authService.userMetaStore.total_grz_current_position_value_$))
    }
    // let totalgry = this.getGRYBalance()
    // if (this.algoService.grzMetric.TotalValue == 0 && totalgry == 0){
    //   return 0
    // } else {
    //   return Math.round(totalgry*100/(totalgry + (this.algoService.grzMetric.TotalValue | 0)))
    // }

  }
  calPercentGRZ(){
    let totalgry = this.getGRYBalance()
    if (this.authService.userMetaStore.total_grz_current_position_value_$ == 0 && totalgry == 0){
      return 0
    } else {
      return 100 - this.calPercentGRY()
    }
    // if (this.algoService.grzMetric.TotalValue == 0 && totalgry == 0){
    //   return 0
    // } else {
    //   return 100 - this.calPercentGRY()
    // }
  }
  getTotalOpenPosition(){
    return this.authService.userMetaStore.total_gry1_open_positions + this.authService.userMetaStore.total_gry2_open_positions + 
    this.authService.userMetaStore.total_gry3_open_positions + this.authService.userMetaStore.total_grz_open_positions
    // this.algoService.grzMetric.Positions + this.algoService.gry1Metric.Positions + 
    // this.algoService.gry2Metric.Positions + this.algoService.gry3Metric.Positions
  }
  // getTotalAccountValue(){
  //   return this.xlmInUsd() + this.grxInUsd() + this.getAlgoBalance()
  // }
  getGRYProfit(){
    return this.authService.userMetaStore.total_gry1_current_position_ROI_$ + this.authService.userMetaStore.total_gry1_close_positions_ROI_$ +
    this.authService.userMetaStore.total_gry2_current_position_ROI_$ + this.authService.userMetaStore.total_gry2_close_positions_ROI_$ +
    this.authService.userMetaStore.total_gry3_current_position_ROI_$ + this.authService.userMetaStore.total_gry3_close_positions_ROI_$
    // this.algoService.gry1Metric.CurrentProfit + 
    // this.algoService.gry2Metric.CurrentProfit + this.algoService.gry3Metric.CurrentProfit

  }
  getTotalAccountProfit(){
    return this.getGRYProfit() + this.authService.userMetaStore.total_grz_close_positions_ROI_$ + this.authService.userMetaStore.total_grz_current_position_ROI_$
    
  }


  
  
  

}