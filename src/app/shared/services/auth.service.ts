
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { AngularFireAuth } from "angularfire2/auth";
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { createHash } from 'crypto';
import { UserInfo, Setting } from 'src/app/models/user.model';


export interface UserMeta {UrWallet: number; UrGRY1: number; UrGRY2: number; UrGRY3: number; UrGRZ: number; UrGeneral: number; OpenOrders: number; OpenOrdersGRX: number; 
  OpenOrdersXLM: number; GRX: number; XLM: number; ShouldReload?: boolean; TokenExpiredTime?:number}

  export interface Prices {xlmp: number; grxp: number; sellingWallet: string; sellingPercent: number; sellingPrice:number}
@Injectable({
  providedIn: 'root' 
})
export class AuthService {
  userData: any; // Save logged in user data
  _userMeta: Subject<UserMeta>
  userMeta:  Observable<UserMeta>
  userMetaStore:  UserMeta = {UrWallet: 0, UrGRY1: 0, UrGRY2: 0, UrGRY3: 0, UrGRZ: 0, UrGeneral: 0, OpenOrders: 0, OpenOrdersGRX: 0, 
  OpenOrdersXLM: 0, GRX: 0, XLM: 0, ShouldReload: true}

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

  getUserMeta(){
    if (this.userMetaStore.ShouldReload){
      this._userMeta = new Subject<UserMeta>()
      this.userMeta = this._userMeta.asObservable()
      this.afs.doc<UserMeta>('users_meta/'+this.userData.Uid).valueChanges().subscribe(data => {        
        this.userMetaStore.UrGRY1 = data.UrGRY1 >= 0? data.UrGRY1:0
        this.userMetaStore.UrGRY2 = data.UrGRY2 >= 0? data.UrGRY2:0 
        this.userMetaStore.UrGRY3 = data.UrGRY3 >= 0? data.UrGRY3:0
        this.userMetaStore.UrGRZ= data.UrGRZ >= 0? data.UrGRZ:0
        this.userMetaStore.UrWallet = data.UrWallet >= 0? data.UrWallet:0
        this.userMetaStore.UrGeneral = data.UrGeneral >= 0? data.UrGeneral:0
        this.userMetaStore.TokenExpiredTime = data.TokenExpiredTime
        // if (!(this.userMetaStore.GRX > 0 || this.userMetaStore.XLM > 0)){        
        //   this.userMetaStore.GRX = data.GRX > 0? Number(data.GRX):0
        //   this.userMetaStore.XLM = data.XLM > 0? Number(data.XLM):0
        // }
        console.log('this.userMetaStore:', this.userMetaStore)
        this.userMetaStore.ShouldReload = false
        this._userMeta.next(data)
      })
    }
  }

  streamPrices(){
    if (this.userMetaStore.ShouldReload){
      this._userMeta = new Subject<UserMeta>()
      this.userMeta = this._userMeta.asObservable()
      this.afs.doc<Prices>('prices/'+this.priceDoc).valueChanges().subscribe(data => {        
        this.userData.xlmPrice = data.xlmp
        this.userData.grxPrice = data.grxp
        this.userInfo.SellingWallet = data.sellingWallet
        this.userInfo.SellingPercent = data.sellingPercent
        this.userInfo.SellingPrice = data.sellingPrice
        console.log('STREAM-price:', data)        
       
      })
    }
  }

  updateUserMeta(){
    this.userMetaStore.GRX = Number(this.userMetaStore.GRX)
    this.userMetaStore.XLM = Number(this.userMetaStore.XLM)
    this.afs.doc('users_meta/'+this.userData.Uid).update(this.userMetaStore)
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
      console.log('GetSecretKey')
      if (this.secretKey){
        console.log('GetSecretKey1')
        resolve(this.secretKey)
      } else {
        console.log('GetSecretKey2')
        let password = pwd
        if (this.hash){
          console.log('GetSecretKey3')
          password = this.hash
        }
        if (!password){
          console.log('GetSecretKey4')
          return ''
        }
        console.log('GetSecretKey5')
        this.stellarService.decryptSecretKey(password, {Salt: this.userInfo.SecretKeySalt, EnSecretKey:this.userInfo.EnSecretKey}, 
          SecKey => {
            if (SecKey != ''){
              console.log('GetSecretKey6')
              //this.secretKey = this.stellarService.SecretBytesToString(SecKey)
              resolve(this.secretKey)
            } else {
              console.log('GetSecretKey7')
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
        LoanPaidStatus: data.LoanPaidStatus, Tfa: data.Tfa, Expire: data.Expire,Setting: setting, PublicKey: data.PublicKey, LocalKey: data.LocalKey}
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
      console.log('GetOpenOrder ')
      this.openOrders = +localStorage.getItem('openOrders')
    }
    if (!this.openOrders){
      console.log('GetOpenOrder 1')
      this.openOrders = 0
    }
    console.log('GetOpenOrder - openOrders', this.openOrders)
    return this.openOrders
  }
  
  GetLocalUserData():any {
    console.log('GetLocalUserData call')    
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


  constructor(    
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    public stellarService: StellarService,  
    private afs: AngularFirestore,      
  ) {    
   
  }

  
  
  isActivated() : boolean {    
    console.log(this.userInfo)
    if (!this.userInfo.PublicKey || (this.userInfo.PublicKey && this.userInfo.PublicKey.trim().length === 0)){      
      return false
    }
    
    return true
  }
  setupTfa(account:string) {
    return this.http.post(`api/v1/users/setuptfa`, { account: account})             
  }

  verifyTx(ledger, action, price): Promise<any> {
    return new Promise((resolve, reject) => {
    this.http.post(`api/v1/users/txverify`, {ledger: ledger, action: action, price: price})    
    .subscribe(
      resp => {
        resolve(resp)    
      },
      err => {
        reject(err)
        console.log('verify ledger exp: ', err)        
      } 
    )    
    })
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
    console.log(this.userData)
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
  grxInUsd(){
    return this.userMetaStore.GRX*this.userData.grxPrice*this.userData.xlmPrice
  }
  xlmInUsd(){
    return this.userMetaStore.XLM*this.userData.xlmPrice
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
  getMaxAvailableGRX(){
    //console.log('this.userMetaStore.', this.userMetaStore)
    return this.userMetaStore.GRX - this.userMetaStore.OpenOrdersGRX
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
  SignOut() {
    
    localStorage.removeItem('user');    
    this.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')      
    })
  }

}