
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from "rxjs";

import { AngularFireAuth } from "angularfire2/auth";
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { createHash } from 'crypto';
import { UserInfo, Setting } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any; // Save logged in user data
  tfa$ = new BehaviorSubject<any>({})
  hash: string
  seedData: any
  // xlm loan paid ledger id
  loanPaidLedgerId: any
  openOrders: number
  secretKey: any
  userInfo: UserInfo

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
        
        this.stellarService.decryptSecretKey(password, 
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

  ParseUserInfo(data):UserInfo {
    let setting = new Setting(data.Setting.AppAlgo,
      data.Setting.AppGeneral,
      data.Setting.AppWallet,
      data.Setting.IpConfirm,
      data.Setting.MailAlgo,
      data.Setting.MailGeneral,
      data.Setting.MailWallet,
      data.Setting.MulSignature)     
    this.userInfo = new UserInfo(data.Uid, data.EnSecretKey, data.SecretKeySalt, 
      data.LoanPaidStatus, data.Tfa, data.Expire, setting, data.PublicKey)
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
  ) {    
   
  }
  
  isActivated() : boolean {    
    //let seedData = this.GetSeedData()    
    if (!this.userData.PublicKey || (this.userData.PublicKey && this.userData.PublicKey.trim().length === 0)){      
      return false
    }
    // } else if (seedData){
    //   return false
    // }    
    return true
  }
  setupTfa(account:string) {
    return this.http.post(`api/v1/users/setuptfa`, { account: account})             
  }

  
  verifyTfaAuth(token: any, secret: any, exp: Number) {       
    return this.http.post(`api/v1/users/verifytoken`,  { token: token, secret:secret, expire:exp})         
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
    this.stellarService.encryptSecretKey(password, JSON.stringify(this.seedData), (encryptedSeed) => { 
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
    return Math.round(+this.userData.totalXLM*this.userData.xlmPrice*100/(+this.userData.totalXLM*this.userData.xlmPrice + 
      this.userData.totalGRX*this.userData.grxPrice*this.userData.xlmPrice))
  }
  calPercentGRX(){
    return 100 - this.calPercentXLM()
  }
  grxInUsd(){
    return +this.userData.totalGRX*this.userData.grxPrice*this.userData.xlmPrice
  }
  xlmInUsd(){
    return +this.userData.totalXLM*this.userData.xlmPrice
  }
  getMaxAvailableXLM(){
    if (this.userData.OpenOrders && this.userData.OpenOrdersXLM){
      return +this.userData.totalXLM - 1.50001 - +this.userData.OpenOrders*0.5 - +this.userData.OpenOrdersXLM
    } else {
      return +this.userData.totalXLM - 1.50001                     
    }
  }
  getMaxAvailableGRX(){
    if (this.userData.OpenOrdersGRX){
      return (+this.userData.totalGRX - +this.userData.OpenOrdersGRX)
    } else {
      return +this.userData.totalGRX
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
  SignOut() {
    
    localStorage.removeItem('user');    
    this.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')      
    })
  }

}