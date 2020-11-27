
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
import { AlgoPositionModel } from '../data/models/algoPositionModel';


export interface UserMeta {UrWallet: 0, UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number}

export interface AlgoMetric {GRYs: number; GRZs: number; GRYBl: number; GRZBl: number; TotalAccountBl: number; 
  TotalAccountProfit: number; TotalOpenPosition: number; PercentGRX: number;PercentXLM: number;GRXInUsd: number;XLMInUsd: number}

export interface AlgoMetrics {Positions: number; CurrentProfit: number; TotalValue: number;ClosedProfit: number;}

export interface AlgoMetricROI {OneDayPercent:number; SevenDayPercent:number; ROIPercent:number;}


@Injectable({
  providedIn: 'root'
})
export class AlgoService {
  
  algoMetric: AlgoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
    TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
  
  grzMetric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
  gry1Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
  gry2Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
  gry3Metric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
  gryMetric: AlgoMetrics = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}

  gry1MetricROI: AlgoMetricROI = {OneDayPercent:0,  SevenDayPercent : 0,  ROIPercent : 0}
  gry2MetricROI: AlgoMetricROI = {OneDayPercent:0,  SevenDayPercent : 0,  ROIPercent : 0}
  gry3MetricROI: AlgoMetricROI = {OneDayPercent:0,  SevenDayPercent : 0,  ROIPercent : 0}
  grzMetricROI: AlgoMetricROI = {OneDayPercent:0,  SevenDayPercent : 0,  ROIPercent : 0}
  gryMetricROI: AlgoMetricROI = {OneDayPercent:0,  SevenDayPercent : 0,  ROIPercent : 0}

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

  closeAllPositions: any

  noticeId:string

  // use to manage the current position
  currentPositionModel:any
  currentOpenPosition:any
  currentURL:string

  // sub retry success
  retrySuccess$: Observable<boolean>
  retrySuccess: Subject<boolean>
  
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
    this.retrySuccess = new Subject<true>()
  }

  subRetrySuccess(){
    if (!this.retrySuccess$){
      this.retrySuccess$ = this.retrySuccess.asObservable()
    }
  }

  subsAlgoPositions(){
    if (!this.algoPositions$){
      this.algoPositionCollection = this.afs.collection<ClosePosition>('algo_positions/users/'+this.authService.userData.Uid);
      this.algoPositions$ = this.algoPositionCollection.valueChanges();
    }
  }

  resetServiceData(){
    this.algoMetric = {GRYs: 0, GRZs: 0, GRYBl: 0, GRZBl: 0, TotalAccountBl: 0, 
      TotalAccountProfit: 0, TotalOpenPosition: 0, PercentGRX: 0, PercentXLM: 0, GRXInUsd: 0, XLMInUsd: 0}
      this.grzMetric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
      this.gry1Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
      this.gry2Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
      this.gry3Metric = {Positions:0, CurrentProfit:0, TotalValue:0,ClosedProfit:0}
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
    if (!this.openAlgos$){
      this.openAlgos$ = this.getCollection(path, ref => ref 
        .where('status', '==', 'OPEN'))
    }
  }

  getAlgoPositions(){
    let algoPostionPath = 'algo_positions/GRZ/algo_positions_open/'
    if(this.fsdb){
      this.fsdb.collection(algoPostionPath).onSnapshot(snapshot => {      
        snapshot.docChanges().forEach( change => {
          
        });
      })
    }
  }

  // getTotalAccountBl(){
  //     return this.authService.grxInUsd() + this.authService.xlmInUsd() + this.authService.userMetaStore.total_grz_current_position_value_$
  //      + this.authService.userMetaStore.total_gry1_current_position_value_$ + this.authService.userMetaStore.total_gry2_current_position_value_$
  //      + this.authService.userMetaStore.total_gry3_current_position_value_$ 
  // }

  getTotalProfit(){
    return this.gryMetric.ClosedProfit + this.gryMetric.CurrentProfit + this.grzMetric.ClosedProfit + this.grzMetric.CurrentProfit
  }
  getTotalProfit1(){
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
  
  getAlgoRoi(){         
    if (this.gry1MetricROI.ROIPercent == 0 ) {
      this.http.get("api/v1/users/getalgoroi").subscribe(
        data => {       
          let res = data as any   
          
          this.gry1MetricROI.OneDayPercent = res.gry1s[0]   
          this.gry1MetricROI.SevenDayPercent = res.gry1s[1] 
          this.gry1MetricROI.ROIPercent = res.gry1s[2] 

          this.gry2MetricROI.OneDayPercent = res.gry2s[0]   
          this.gry2MetricROI.SevenDayPercent = res.gry2s[1] 
          this.gry2MetricROI.ROIPercent = res.gry2s[2] 

          this.gry3MetricROI.OneDayPercent = res.gry3s[0]   
          this.gry3MetricROI.SevenDayPercent = res.gry3s[1] 
          this.gry3MetricROI.ROIPercent = res.gry3s[2] 

          this.grzMetricROI.OneDayPercent = res.grzs[0]   
          this.grzMetricROI.SevenDayPercent = res.grzs[1] 
          this.grzMetricROI.ROIPercent = res.grzs[2] 

          this.gryMetricROI.OneDayPercent = Math.max(this.gry1MetricROI.OneDayPercent, this.gry2MetricROI.OneDayPercent, this.gry3MetricROI.OneDayPercent)  
          this.gryMetricROI.SevenDayPercent = Math.max(this.gry1MetricROI.SevenDayPercent, this.gry2MetricROI.SevenDayPercent, this.gry3MetricROI.SevenDayPercent)
          this.gryMetricROI.ROIPercent =  Math.max(this.gry1MetricROI.ROIPercent, this.gry2MetricROI.ROIPercent, this.gry3MetricROI.ROIPercent) 

        },
        e => {
          //console.log(e)
        }
      )
    }
  }

  getGRYBalance(){
    // if (this.authService.userMetaStore && this.authService.userMetaStore.total_gry1_current_position_value_$){
    //   return this.authService.userMetaStore.total_gry1_current_position_value_$ + this.authService.userMetaStore.total_gry2_current_position_value_$ + 
    //   this.authService.userMetaStore.total_gry3_current_position_value_$
    // }
    return this.gryMetric.TotalValue
  }
  getAlgoBalance(){
    
    return this.grzMetric.TotalValue + this.gryMetric.TotalValue
    
    
  }
  getAlgoBalance1(){
    if (this.authService.userMetaStore && this.authService.userMetaStore.total_grz_current_position_value_$){
      return this.getGRYBalance() + this.authService.userMetaStore.total_grz_current_position_value_$
    } 
    return 0
    
  }
  calPercentGRY(){
    let totalgry = this.gryMetric.TotalValue
    if (this.grzMetric.TotalValue == 0 && totalgry == 0){
      return 0
    } else {
      return Math.round(totalgry*100/(totalgry + this.grzMetric.TotalValue))
    }
    // let totalgry = this.getGRYBalance()
    // if (this.algoService.grzMetric.TotalValue == 0 && totalgry == 0){
    //   return 0
    // } else {
    //   return Math.round(totalgry*100/(totalgry + (this.algoService.grzMetric.TotalValue | 0)))
    // }

  }
  calPercentGRZ(){
    let totalgry = this.gryMetric.TotalValue
    if (this.grzMetric.TotalValue == 0 && totalgry == 0){
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
    // if (this.authService.userMetaStore && this.authService.userMetaStore.total_gry1_open_positions 
    //   && this.authService.userMetaStore.total_grz_open_positions){
    //   return this.authService.userMetaStore.total_gry1_open_positions + this.authService.userMetaStore.total_gry2_open_positions + 
    //     this.authService.userMetaStore.total_gry3_open_positions + this.authService.userMetaStore.total_grz_open_positions
    // }

    return this.grzMetric.Positions + this.gryMetric.Positions
    //return 0
  }
  getTotalOpenPosition1(){
    if (this.authService.userMetaStore && this.authService.userMetaStore.total_gry1_open_positions 
      && this.authService.userMetaStore.total_grz_open_positions){
      return this.authService.userMetaStore.total_gry1_open_positions + this.authService.userMetaStore.total_gry2_open_positions + 
        this.authService.userMetaStore.total_gry3_open_positions + this.authService.userMetaStore.total_grz_open_positions
    }
    return 0
  }
  // getTotalAccountValue(){
  //   return this.xlmInUsd() + this.grxInUsd() + this.getAlgoBalance()
  // }
  getGRYProfit(){
    // let val = 0
    // if (this.authService.userMetaStore){
    //   //console.log('getGRYProfit - usermetastore', this.authService.userMetaStore)
    //   val = this.authService.userMetaStore.total_gry1_current_position_ROI_$ + this.authService.userMetaStore.total_gry1_close_positions_ROI_$ +
    //   this.authService.userMetaStore.total_gry2_current_position_ROI_$ + this.authService.userMetaStore.total_gry2_close_positions_ROI_$ +
    //   this.authService.userMetaStore.total_gry3_current_position_ROI_$ + this.authService.userMetaStore.total_gry3_close_positions_ROI_$
    // }
    //console.log('getGRYProfit ret', val)
    return this.gryMetric.CurrentProfit + this.gryMetric.ClosedProfit
   
        
  }
  getTotalAccountProfit(){
    // if (this.authService.userMetaStore){
    //   return this.getGRYProfit() + this.authService.userMetaStore.total_grz_close_positions_ROI_$ + this.authService.userMetaStore.total_grz_current_position_ROI_$
    // }
    return this.grzMetric.ClosedProfit + this.grzMetric.CurrentProfit + this.gryMetric.CurrentProfit + this.gryMetric.ClosedProfit
    //return 0
  }


  
  
  

}