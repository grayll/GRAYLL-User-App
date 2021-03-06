
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { AngularFireAuth } from "angularfire2/auth";
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { createHash } from 'crypto';
import { UserInfo, Setting } from 'src/app/models/user.model';
import { CountdownConfig } from 'ngx-countdown/src/countdown.config';
import * as moment from 'moment';
import {SubSink} from 'subsink'
import { AlgoService } from 'src/app/system/algo.service';
import { LoadingService } from './loading.service';


export interface UserMeta {UrWallet: number; UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number; ShouldReload?: boolean; TokenExpiredTime?:number
  total_grz_close_positions_ROI_$: number;
  total_grz_current_position_ROI_$: number;
  total_grz_current_position_value_$: number;
  total_grz_open_positions: number;

  total_gry1_close_positions_ROI_$: number;
  total_gry1_current_position_ROI_$: number;
  total_gry1_current_position_value_$: number;
  total_gry1_open_positions: number;

  total_gry2_close_positions_ROI_$: number;
  total_gry2_current_position_ROI_$: number;
  total_gry2_current_position_value_$: number;
  total_gry2_open_positions: number;

  total_gry3_close_positions_ROI_$: number;
  total_gry3_current_position_ROI_$: number;
  total_gry3_current_position_value_$: number;
  total_gry3_open_positions: number;
}

export interface Prices {price_updated?: string; xlmgrx_ask:number; xlmgrx_bid: number; xlmusd: number; grxusd: number; xlmgrx: number; gryusd: number;grzusd: number; sellingWallet: string; sellingPercent: number; sellingPrice:number}
export interface Prices1 {xlmp: number; grxp: number;gryp: number;grzp: number; sellingWallet: string; sellingPercent: number; sellingPrice:number}
export interface PriceInfo {price_updated?: string; xlmgrx_ask:number; xlmgrx_bid: number; xlmusd: number; grxusd: number; xlmgrx: number; gryusd: number;grzusd: number;}

@Injectable({
  providedIn: 'root' 
})
export class AuthService {
  userData: any; // Save logged in user data
  _userMeta: Subject<UserMeta>
  userMeta:  Observable<UserMeta>
  userMetaStore:  UserMeta = {UrWallet: 0, UrGRY1: 0, UrGRY2: 0, UrGRY3: 0, UrGRZ: 0, UrGeneral: 0, OpenOrders: 0, OpenOrdersGRX: 0, 
    OpenOrdersXLM: 0, GRX: 0, XLM: 0, ShouldReload: true,
    total_grz_close_positions_ROI_$:0, total_grz_current_position_value_$:0, total_grz_open_positions:0, total_grz_current_position_ROI_$:0,
    total_gry1_close_positions_ROI_$:0, total_gry1_current_position_value_$:0, total_gry1_open_positions:0, total_gry1_current_position_ROI_$:0,
    total_gry2_close_positions_ROI_$:0, total_gry2_current_position_value_$:0, total_gry2_open_positions:0, total_gry2_current_position_ROI_$:0,
    total_gry3_close_positions_ROI_$:0, total_gry3_current_position_value_$:0, total_gry3_open_positions:0, total_gry3_current_position_ROI_$:0
  }

  priceInfo: PriceInfo = {xlmgrx_ask:0, xlmgrx_bid:0, xlmusd: 0, grxusd: 0, xlmgrx: 0, gryusd: 0, grzusd: 0}
  
  tfa$ = new BehaviorSubject<any>({})
  hash: string
  seedData: any
  // xlm loan paid ledger id
  loanPaidLedgerId: any
  openOrders: number
  secretKey: any
  userInfo: UserInfo
  
  userInfoMsg: Subject<UserInfo>
  shouldReload:Subject<boolean>
  reload:boolean = true
  priceDoc = '794retePzavE19bTcMaH/'

  isGetBalance: boolean
  percentXLM : number = 100
  // variable to not load userMetaStore and price every time if page is not reload

  // UserMeta
  balanceUpdateCount: number = 0
  userMeta$ : Observable<UserMeta>
  priceData$ : Observable<any>
  countdownConfigs: CountdownConfig[] 

  gryUpdatedAt: number
  grzUpdatedAt: number
  closeAllEnd:Subject<boolean>

  subsink:SubSink
  isSubUserMeta: boolean = false
  isSubPrice: boolean = false
  isSubPosition: boolean = false


  timeOutShowConfirmPwd:any;
  timeOutLogout:any;
  editRefItem: any
  resetServiceData(){
    this.userData = null
    this.userInfo = null
    this.userInfoMsg = null
    this.userMeta = null    
    this.userMeta$ = null
    
    this.countdownConfigs = null
    this.gryUpdatedAt = null
    this.grzUpdatedAt = null
    this.closeAllEnd = null
    this.hash = null
    this.seedData = null

    this.loanPaidLedgerId = null
    this.openOrders = 0
    this.secretKey = null

    this.userMetaStore = {UrWallet: 0, UrGRY1: 0, UrGRY2: 0, UrGRY3: 0, UrGRZ: 0, UrGeneral: 0, OpenOrders: 0, OpenOrdersGRX: 0, 
      OpenOrdersXLM: 0, GRX: 0, XLM: 0, ShouldReload: true,
      total_grz_close_positions_ROI_$:0, total_grz_current_position_value_$:0, total_grz_open_positions:0, total_grz_current_position_ROI_$:0,
      total_gry1_close_positions_ROI_$:0, total_gry1_current_position_value_$:0, total_gry1_open_positions:0, total_gry1_current_position_ROI_$:0,
      total_gry2_close_positions_ROI_$:0, total_gry2_current_position_value_$:0, total_gry2_open_positions:0, total_gry2_current_position_ROI_$:0,
      total_gry3_close_positions_ROI_$:0, total_gry3_current_position_value_$:0, total_gry3_open_positions:0, total_gry3_current_position_ROI_$:0}

    this.priceInfo = {xlmgrx_ask:0, xlmgrx_bid:0, xlmusd: 0, grxusd: 0, xlmgrx: 0, gryusd: 0,grzusd: 0}

    this.countdownConfigs = [{
        leftTime: 60,
        template: '$!s!',
        effect: null,
        demand: false
      },
      {
        leftTime: 60,
        template: '$!s!',
        effect: null,
        demand: false
      }    
    ]
    this.gryUpdatedAt = moment.now()
    this.grzUpdatedAt = moment.now()    
    this.subsink = null
    this.userMeta$ = null
    this.priceData$ = null
    this.isSubPosition = false
    this.isSubUserMeta = false
    this.isSubPrice = false
  }
  
  constructor(    
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    public stellarService: StellarService,  
    public loadingService: LoadingService,
    private afs: AngularFirestore,      
  ) { 
    this.percentXLM = 100   
    this.countdownConfigs = [{
        leftTime: 60,
        template: '$!s!',
        effect: null,
        demand: false
      },
      {
        leftTime: 60,
        template: '$!s!',
        effect: null,
        demand: false
      }    
    ]
    this.gryUpdatedAt = moment.now()
    this.grzUpdatedAt = moment.now()
    this.subsink = new SubSink()
    
    this.userMetaStore = {UrWallet: 0, UrGRY1: 0, UrGRY2: 0, UrGRY3: 0, UrGRZ: 0, UrGeneral: 0, OpenOrders: 0, OpenOrdersGRX: 0, 
      OpenOrdersXLM: 0, GRX: 0, XLM: 0, ShouldReload: true,
      total_grz_close_positions_ROI_$:0, total_grz_current_position_value_$:0, total_grz_open_positions:0, total_grz_current_position_ROI_$:0,
      total_gry1_close_positions_ROI_$:0, total_gry1_current_position_value_$:0, total_gry1_open_positions:0, total_gry1_current_position_ROI_$:0,
      total_gry2_close_positions_ROI_$:0, total_gry2_current_position_value_$:0, total_gry2_open_positions:0, total_gry2_current_position_ROI_$:0,
      total_gry3_close_positions_ROI_$:0, total_gry3_current_position_value_$:0, total_gry3_open_positions:0, total_gry3_current_position_ROI_$:0}
  }
  unSubUserMeta(){
    if (this.subsink){
      this.subsink.unsubscribe()
     }
  }
  parseUserMeta(data){
    
    this.userMetaStore.UrGRY1 = data.UrGRY1 >= 0? data.UrGRY1:0
    this.userMetaStore.UrGRY2 = data.UrGRY2 >= 0? data.UrGRY2:0 
    this.userMetaStore.UrGRY3 = data.UrGRY3 >= 0? data.UrGRY3:0
    this.userMetaStore.UrGRZ = data.UrGRZ >= 0? data.UrGRZ:0
    this.userMetaStore.UrWallet = data.UrWallet >= 0? data.UrWallet:0
    this.userMetaStore.UrGeneral = data.UrGeneral >= 0? data.UrGeneral:0
    this.userMetaStore.TokenExpiredTime = data.TokenExpiredTime   
    
    // prevent update these data when execute buy/sell
    if (!this.loadingService.getLoading()){
      this.userMetaStore.GRX = data.GRX >= 0? data.GRX:0
      this.userMetaStore.XLM = data.XLM >= 0? data.XLM:0
      this.userMetaStore.OpenOrders = data.OpenOrders > 0? data.OpenOrders:0
      this.userMetaStore.OpenOrdersXLM = data.OpenOrdersXLM > 0? data.OpenOrdersXLM:0
      this.userMetaStore.OpenOrdersGRX = data.OpenOrdersGRX > 0? data.OpenOrdersGRX:0
    }

    this.userMetaStore.total_grz_close_positions_ROI_$ = +(data.total_grz_close_positions_ROI_$ ? data.total_grz_close_positions_ROI_$ : 0).toFixed(5)
    this.userMetaStore.total_grz_current_position_ROI_$ = +(data.total_grz_current_position_ROI_$ ? data.total_grz_current_position_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_grz_current_position_value_$ = +(data.total_grz_current_position_value_$ ? data.total_grz_current_position_value_$: 0).toFixed(5)
    this.userMetaStore.total_grz_open_positions = +(data.total_grz_open_positions ? data.total_grz_open_positions: 0).toFixed(5)

    this.userMetaStore.total_gry1_close_positions_ROI_$ = +(data.total_gry1_close_positions_ROI_$ ? data.total_gry1_close_positions_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry1_current_position_ROI_$ = +(data.total_gry1_current_position_ROI_$ ? data.total_gry1_current_position_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry1_current_position_value_$ = +(data.total_gry1_current_position_value_$ ? data.total_gry1_current_position_value_$ : 0).toFixed(5)
    this.userMetaStore.total_gry1_open_positions = +(data.total_gry1_open_positions ? data.total_gry1_open_positions: 0).toFixed(5)

    this.userMetaStore.total_gry2_close_positions_ROI_$ = +(data.total_gry2_close_positions_ROI_$ ? data.total_gry2_close_positions_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry2_current_position_ROI_$ = +(data.total_gry2_current_position_ROI_$ ? data.total_gry2_current_position_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry2_current_position_value_$ = +(data.total_gry2_current_position_value_$ ? data.total_gry2_current_position_value_$: 0).toFixed(5)
    this.userMetaStore.total_gry2_open_positions = +(data.total_gry2_open_positions ? data.total_gry2_open_positions: 0).toFixed(5)

    this.userMetaStore.total_gry3_close_positions_ROI_$ = +(data.total_gry3_close_positions_ROI_$ ?  data.total_gry3_close_positions_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry3_current_position_ROI_$ = +(data.total_gry3_current_position_ROI_$ ? data.total_gry3_current_position_ROI_$: 0).toFixed(5)
    this.userMetaStore.total_gry3_current_position_value_$ = +(data.total_gry3_current_position_value_$ ? data.total_gry3_current_position_value_$: 0).toFixed(5)
    this.userMetaStore.total_gry3_open_positions = +(data.total_gry3_open_positions ? data.total_gry3_open_positions: 0).toFixed(5)
    this.balanceUpdateCount++      
    this.userMetaStore.ShouldReload = false
  }
  getUserMeta(){    
      if (!this.userMeta$){
        this.userMeta$ = this.afs.doc<UserMeta>('users_meta/'+this.userData.Uid).valueChanges()
      }
      if (!this.subsink){
        this.subsink = new SubSink()
      }     
  }
  
  parsePriceData(data){
  
    if (this.userData){
      this.userData.xlmPrice = data.xlmusd
      this.userData.grxPrice = data.xlmgrx
      this.userData.gryPrice = data.gryusd
      this.userData.grzPrice = data.grzusd
      this.userData.grxusdPrice = data.grxusd
    }
    if (this.userInfo){
      this.userInfo.SellingWallet = data.sellingWallet
      this.userInfo.SellingPercent = data.sellingPercent
      this.userInfo.SellingPrice = data.sellingPrice
    }
   
    this.priceInfo.grxusd = data.grxusd
    this.priceInfo.xlmgrx = data.xlmgrx  
    this.priceInfo.xlmusd = data.xlmusd
    this.priceInfo.gryusd = data.gryusd
    this.priceInfo.grzusd = data.grzusd
    this.priceInfo.xlmgrx_ask = data.xlmgrx_ask
    this.priceInfo.xlmgrx_bid = data.xlmgrx_bid
    if (this.priceInfo.price_updated != data.price_updated){
      if (data.price_updated === 'gryusd'){
        //console.log('update gry')
        this.gryUpdatedAt = moment.now()
        60 - (moment.now() - this.gryUpdatedAt)/1000
        this.countdownConfigs[0] = {
          leftTime: 60,
          template: '$!s!',
          effect: null,
          demand: false
        } 
        
      } else {            
        this.grzUpdatedAt = moment.now()
        this.countdownConfigs[1] = {
          leftTime: 60,
          template: '$!s!',
          effect: null,
          demand: false
        }
        
      }
      this.priceInfo.price_updated = data.price_updated
    }  
  }
  streamPrices(){    
    if (!this.priceData$){
      this.priceData$ = this.afs.doc<Prices>('price_update/'+this.priceDoc).valueChanges()
    }     
  }
  
  updateUserMeta(orderOpt:boolean){
    if (this.userMetaStore && this.userData){
      //console.log('updateUserMeta:', this.userMetaStore.GRX , this.userMetaStore.XLM)
      if (orderOpt){
        this.userMetaStore.GRX = Number(this.userMetaStore.GRX)
        this.userMetaStore.XLM = Number(this.userMetaStore.XLM)
        this.userMetaStore.OpenOrders = Number(this.userMetaStore.OpenOrders)
        this.userMetaStore.OpenOrdersGRX = Number(this.userMetaStore.OpenOrdersGRX)
        this.afs.doc('users_meta/'+this.userData.Uid).update({GRX:Number(this.userMetaStore.GRX), XLM:Number(this.userMetaStore.XLM), 
          OpenOrders: this.userMetaStore.OpenOrders, OpenOrdersGRX:this.userMetaStore.OpenOrdersGRX,OpenOrdersXLM:this.userMetaStore.OpenOrdersXLM,
        })
      } else {
        this.userMetaStore.GRX = Number(this.userMetaStore.GRX)
        this.userMetaStore.XLM = Number(this.userMetaStore.XLM)
        this.afs.doc('users_meta/'+this.userData.Uid).update({GRX:Number(this.userMetaStore.GRX), XLM:Number(this.userMetaStore.XLM)})
      }
    }
  }
 

  subShouldReload(){
    if (!this.shouldReload){
      this.shouldReload = new Subject()
    }
    return this.shouldReload.asObservable()
  }

  pushShouldReload(shouldReload){
    if (!this.shouldReload){
      this.shouldReload = new Subject()
    }
    this.shouldReload.next(shouldReload)
  }
  unSubShouldReload(){
    if (this.shouldReload){
      this.shouldReload.unsubscribe()
    }
    
  }
  subCloseAllEnd(){
    if (!this.closeAllEnd){
      this.closeAllEnd = new Subject()
    }
    return this.closeAllEnd.asObservable()
  }
  unsubCloseAllEnd(){
    if (this.closeAllEnd){
      this.closeAllEnd.unsubscribe()
    }
    
  }

  pushCloseAllEnd(closeAllEnd){
    if (!this.closeAllEnd){
      this.closeAllEnd = new Subject()
    }
    this.closeAllEnd.next(closeAllEnd)
  }

  getUserInfoMsg(){
    if (!this.userInfoMsg){
      this.userInfoMsg = new Subject()
    }
    return this.userInfoMsg.asObservable()
  }

  pushUserInfoMsg(userInfo:UserInfo){
    if (!this.userInfoMsg){
      this.userInfoMsg = new Subject()
    }
    this.userInfoMsg.next(userInfo)
  }
  getSecretKey():string {
    return this.stellarService.SecretBytesToString(this.secretKey)
  }
  GetSecretKey1(pwd):Promise<any>{
    return new Promise((resolve, reject) => {
      if (this.secretKey){
        resolve(this.secretKey)
      } else {
        let password = pwd
        if (this.hash){
          password = this.hash
        }
        if (!password){
          return ''
        }
        
        this.stellarService.decryptSecretKey1(password, 
          {Salt: this.userInfo.SecretKeySalt, EncryptedSecretKey:this.userInfo.EnSecretKey}, 
          SecKey => {
            if (SecKey != ''){
              this.secretKey = this.stellarService.SecretBytesToString(SecKey)
              resolve(this.secretKey)
            } else {
              reject('')
            }
          })
        }
      })
  }

  DecryptLocalSecret(){
    if (!this.secretKey){
      if (this.userInfo && this.userData){        
        this.stellarService.decryptSecretKey(this.userInfo.LocalKey, 
          {Salt: this.userInfo.SecretKeySalt, EnSecretKey:this.userData.EnSecretKey}, secretKey => {        
          this.secretKey = secretKey
        })
      }
    }
  }

  GetSecretKey(pwd):Promise<any>{
    return new Promise((resolve, reject) => {
      
      if (this.secretKey){        
        resolve(this.secretKey)
      } else {        
        let password = pwd
        if (this.hash){          
          password = this.hash
        }
        if (!password){          
          return ''
        }        
        this.stellarService.decryptSecretKey(password, {Salt: this.userInfo.SecretKeySalt, EnSecretKey:this.userInfo.EnSecretKey}, 
          SecKey => {
            if (SecKey != ''){
              
              //this.secretKey = this.stellarService.SecretBytesToString(SecKey)
              resolve(this.secretKey)
            } else {
              
              reject('')
            }
          })
        }
      })
  }

  ParseUserInfo(data):UserInfo {
    let setting = new Setting(data.Setting.AppAlgo,
      data.Setting.AppGeneral,
      data.Setting.AppWallet,
      data.Setting.IpConfirm,
      data.Setting.MailAlgo,
      data.Setting.MailGeneral,
      data.Setting.MailWallet,
      data.Setting.MulSignature)     
    // this.userInfo = new UserInfo(data.Uid, data.EnSecretKey, data.SecretKeySalt, 
    //   data.LoanPaidStatus, data.Tfa, data.Expire, setting, data.PublicKey)

      this.userInfo = {Uid: data.Uid, EnSecretKey: data.EnSecretKey, SecretKeySalt: data.SecretKeySalt, 
        LoanPaidStatus: data.LoanPaidStatus, Tfa: data.Tfa, Expire: data.Expire,Setting: setting, PublicKey: data.PublicKey, LocalKey: data.LocalKey,
      }

      return this.userInfo
  }

  SetLoanPaidLedgerId(id){
    this.loanPaidLedgerId = id
    localStorage.setItem('loanPaidLedgerId', this.loanPaidLedgerId);   
  }
  RemoveLoanPaidLedgerId(){    
    localStorage.removeItem('loanPaidLedgerId');   
  }
  GetLoadPaidLedgerId(){
    if (!this.loanPaidLedgerId){
      this.loanPaidLedgerId = localStorage.getItem('loanPaidLedgerId')
    }
    return this.loanPaidLedgerId
  }
  SetOpenOrder(id){
    if (id == 0){
      this.openOrders = 0
    } else {
      this.openOrders += id
    }
    if (this.openOrders < 0){
      this.openOrders = 0
    }
    localStorage.setItem('openOrders', this.openOrders.toString());   
  }
  GetOpenOrder():number{
    if (!this.openOrders){      
      this.openOrders = +localStorage.getItem('openOrders')
    }
    if (!this.openOrders){      
      this.openOrders = 0
    }
    
    return this.openOrders
  }
  
  GetLocalUserData():any {     
    if (!this.userData){
      let data = localStorage.getItem('grayll-user');
      if (data){
        this.userData = JSON.parse(data); 
      }      
    }   
    return this.userData
  }
  
  SetLocalUserData(){
    if (this.userData){
      localStorage.setItem('grayll-user', JSON.stringify(this.userData));       
    }    
  }

  GetLocalUserMeta():any {    
    if (this.userMetaStore.XLM === 0){
      let data = localStorage.getItem('grayll-user-meta');
      if (data){
        this.userMetaStore = JSON.parse(data); 
      }      
    }   
    return this.userMetaStore
  }
  
  SetLocalUserMeta(){
    if (this.userMetaStore){
      localStorage.setItem('grayll-user-meta', JSON.stringify(this.userMetaStore));       
    }    
  }

  getTfa(){
    return this.tfa$.value
  }

  setTfa(value){
    return this.tfa$.next(value)
  }
    
  isActivated() : boolean {    
    if (!this.userInfo.PublicKey || (this.userInfo.PublicKey && this.userInfo.PublicKey.trim().length === 0)){      
      return false
    }    
    return true
  }
  setupTfa(account:string) {
    return this.http.post(`api/v1/users/setuptfa`, { account: account})             
  }

  verifyTx(txHash, action, data): Promise<any> {
    return new Promise((resolve, reject) => {
     
    this.http.post(`api/v1/users/txverify`, {txHash: txHash, action: action, data: data})    
    .subscribe(
      resp => {
        resolve(resp)    
      },
      err => {
        reject(err)
              
      } 
    )    
    })
  }
  saveUserMetaStore() {
    if (this.userMetaStore && !this.isTokenExpired){  
      
      this.http.post(`api/v1/users/saveUserMetaData`, {     
        total_grz_current_position_ROI_$: this.userMetaStore.total_grz_current_position_ROI_$,
        total_grz_current_position_value_$:  this.userMetaStore.total_grz_current_position_value_$,    
        total_grz_open_positions:       this.userMetaStore.total_grz_open_positions,          
                                                
        total_gry1_current_position_ROI_$ :    this.userMetaStore.total_gry1_current_position_ROI_$,  
        total_gry1_current_position_value_$ :   this.userMetaStore.total_gry1_current_position_value_$,
        total_gry1_open_positions  :           this.userMetaStore.total_gry1_open_positions,  
                                                
        total_gry2_current_position_ROI_$ :    this.userMetaStore.total_gry2_current_position_ROI_$,  
        total_gry2_current_position_value_$ :   this.userMetaStore.total_gry2_current_position_value_$,
        total_gry2_open_positions  :           this.userMetaStore.total_gry2_open_positions ,          
                                                
        total_gry3_current_position_ROI_$ :    this.userMetaStore.total_gry3_current_position_ROI_$,  
        total_gry3_current_position_value_$ :   this.userMetaStore.total_gry3_current_position_value_$,
        total_gry3_open_positions  :           this.userMetaStore.total_gry3_open_positions                 
      })    
      .subscribe(
        resp => {
          
        },
        err => {        
                
        } 
      )   
    } 
    
  }
  verifyTfaAuth(token: any, pwd: any, exp: Number) {       
    return this.http.post(`api/v1/users/verifytoken`,  { token: token, secret:pwd, expire:exp})         
  }
  UpdateSetting(field, status) {
    return this.http.post(`api/v1/users/updatesetting`,  { field: field, status:status}) 
  }
  UpdateEmail(email, password) {
    return this.http.post(`api/v1/users/updatesetting`,  {email: email, password: password}) 
  }
  updateTfaData(tfa) {   
    return this.http.post(`api/v1/users/updatetfa`, tfa) 
  }

  makeTransaction(xdr, txtype) {   
    return this.http.post(`api/v1/users/MakeTransaction`, {xdr:xdr, tx: txtype}) 
  }

  isTfaEnable(){
    
    if (this.userData.Tfa && this.userData.Tfa.Enable 
      && this.userData.Tfa.Enable === true){
      return true
    }
    return false
  }

  isTokenExpired(){
    let currentTs = Math.round(new Date().getTime()/1000)   
    if (this.userMetaStore && currentTs >= this.userMetaStore.TokenExpiredTime){
      return true
    }
    return false
  }
  isTokenExpired1(){
    let currentTs = Math.round(new Date().getTime()/1000)
    if (!this.userData){
      this.GetLocalUserData()
    }
    if (this.userData && currentTs >= this.userData.tokenExpiredTime){
      return true
    }
    return false
  }
  
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {    
    //console.log('localStorage.getItem()-', localStorage.getItem('user'))     
    const user = this.GetLocalUserData();
    console.log('isLoggedIn:', user)
    if (user && user !== undefined && user !== null){
      return true
    }
    return false;
  }

  SetSeedData(data:any, password: string){
    this.seedData = data
    this.stellarService.encryptSecretKey(password, JSON.stringify(this.seedData), '', (encryptedSeed) => { 
      sessionStorage.setItem('seedData', JSON.stringify(encryptedSeed));  
    })
    
  }
  GetSeedData(password: string, cb) {
    let data = sessionStorage.getItem('seedData');
    if (data){
      let encryptedData = JSON.parse(data); 
      this.stellarService.decryptSecretKey(password, 
        {Salt: encryptedData.Salt, EncryptedSecretKey:encryptedData.EnSecretKey}, 
        SecKey => {
        if (SecKey != ''){
          this.seedData = JSON.parse(this.stellarService.SecretBytesToString(SecKey))
          cb(this.seedData)
        }
      })      
    } 
    //return this.seedData
  }
  RemoveSeedData(){
    sessionStorage.removeItem('seedData');  
    this.seedData = null  
  }
  
  SetLocalTfa(uid, tfa){
    if (tfa){
      let hash = createHash('sha256').update(uid).digest('hex')
      localStorage.setItem(hash, JSON.stringify(tfa));       
    }    
  }
  GetLocalTfa(uid:string){
    let hash = createHash('sha256').update(uid).digest('hex')
    let data = localStorage.getItem(hash);
    if (data){
      return JSON.parse(data);      
    }
    return null
  }
  
  // calPercentXLM(){
  //   if (this.userMetaStore && this. calPercentXLM(){
  //   if (this.userMetaStore.GRX === 0){
  //     return 100
  //   } else {
  //     return Math.round(this.userMetaStore.XLM*this.priceInfo.xlmusd*100/(this.userMetaStore.XLM*this.priceInfo.xlmusd + 
  //       this.userMetaStore.GRX*this.userData.grxPrice*this.priceInfo.xlmusd))
  //   }
  // }
  // calPercentGRX(){    
  //   if (this.userMetaStore && this.priceInfo){
  //    // console.log('calPercentXLM:', this.userMetaStore)
  //     return 100 - this.percentXLM
  //   } else {
  //     return 0
  //   }
  // }
  // calPercentGRX(){
  //   if (this.userData){
  //     return 100 - this.calPercentXLM()
  //   } else {
  //     return 0
  //   }
  // }

  calPercentXLM(){
    if (this.userMetaStore.GRX === 0){
      return 100
    } else {
      return Math.round(this.userMetaStore.XLM*this.userData.xlmPrice*100/(this.userMetaStore.XLM*this.userData.xlmPrice + 
        this.userMetaStore.GRX*this.userData.grxPrice*this.userData.xlmPrice))
    }
  }

  calPercentGRX(){
    if (this.userData){
      return 100 - this.calPercentXLM()
    } else {
      return 0
    }
  }
  // calPercentXLM(){

  //   if (this.userMetaStore.GRX === 0){
  //     this.percentXLM = 100
  //   } else {
  //     this.percentXLM = Math.round(this.userMetaStore.XLM*this.priceInfo.xlmusd*100/(this.userMetaStore.XLM*this.priceInfo.xlmusd + 
  //       this.userMetaStore.GRX*this.priceInfo.xlmgrx*this.priceInfo.xlmusd))
  //   }
  //   return this.percentXLM
  // }

  // calPercentGRX(){
  //   if (this.userMetaStore){
  //     return 100 - this.percentXLM
  //   } else {
  //     return 0
  //   }
  // }
  
  grxInUsd(){
    return this.userMetaStore.GRX*this.priceInfo.xlmgrx*this.priceInfo.xlmusd
  }
  xlmInUsd(){
    return this.userMetaStore.XLM*this.priceInfo.xlmusd
  }
  getMaxAvailableXLM(){
    let bl 
    if (this.userMetaStore.OpenOrders && this.userMetaStore.OpenOrdersXLM){
      bl = +this.userMetaStore.XLM - 2.0001 - +this.userMetaStore.OpenOrders*0.5 - +this.userMetaStore.OpenOrdersXLM
    } else {
      bl = +this.userMetaStore.XLM - 2.0001                     
    }
    if (bl < 0 ){
      bl = 0
    }
    return bl
  }
  getMaxWithdrawXLM(){
    let bl 
    if (this.userMetaStore.OpenOrders && this.userMetaStore.OpenOrdersXLM){
      bl = +this.userMetaStore.XLM - 2.0001 - +this.userMetaStore.OpenOrders*0.5 - +this.userMetaStore.OpenOrdersXLM
    } else {
      bl = +this.userMetaStore.XLM - 2.0001                     
    }
    if (bl < 0 ){
      bl = 0
    } else {
      bl = bl - 0.0000001
    }
    return bl
  }
  getMaxAvailableGRX(){     
    return this.userMetaStore.GRX - this.userMetaStore.OpenOrdersGRX
  }
  getMaxWithdrawGRX(){     
    if (this.userMetaStore.GRX - this.userMetaStore.OpenOrdersGRX > 0){
      return this.userMetaStore.GRX - this.userMetaStore.OpenOrdersGRX - 0.0000001
    } else {
      return this.userMetaStore.GRX - this.userMetaStore.OpenOrdersGRX
    }
  }
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  // SetUserData(user) {
  //   console.log('SetUserData ')
  //   const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);        
  //   return userRef.set(user, {
  //     merge: true
  //   })
  // }
  // Sign out 
  // SignOut() {    
  //   localStorage.removeItem('user');    
  //   this.userData = null  
  //   this.ngZone.run(()=> {
  //     this.router.navigateByUrl('/login')      
  //   })
  // }

}