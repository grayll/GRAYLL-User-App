import { User } from "../services/user";
import { auth } from 'firebase/app';
//import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from "rxjs";
//import { AngularFireDatabase, } from 'angularfire2/database';
import { AngularFireAuth } from "angularfire2/auth";
import { environment } from '../../../environments/environment';
import axios from 'axios';
import { createHash } from 'crypto';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any; // Save logged in user data
  tfa$ = new BehaviorSubject<any>({})
  //user: User;
  //user: AngularFirestoreDocument<User>;

  getTfa(){
    return this.tfa$.value
  }

  setTfa(value){
    return this.tfa$.next(value)
  }

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public firebaseAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public http: HttpClient,
    
  ) {    
   
  }
  
  isActivated(){
    if (!this.userData.PublicKey || 
      this.userData.PublicKey && this.userData.PublicKey.trim().length === 0){
      return false
    }  
    return true
  }
  setupTfa(account:string) {
    //return this.http.get("https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/TfaSetup?account=" + account, { observe: 'response' });
    //let url = `${environment.api_url}verifytoken?token=${token}&secret=${secret}`
    console.log(this.userData.token)
    return axios.post(`${environment.api_url}api/v1/users/setuptfa`, { account: account},
    {
      headers: {
        'Authorization': 'Bearer ' + this.userData.token,        
      }
    })             
  }

  // deleteTfa() {
  //   return this.http.delete("http://127.0.0.1:5555/tfa/disable", { observe: 'response' });
  // }

  verifyTfaAuth(token: any, secret: any, exp: Number) {       
    return axios.post(`${environment.api_url}api/v1/users/verifytoken`,  { token: token, secret:secret, expire:exp},
    {
      headers: {
        'Authorization': 'Bearer ' + this.userData.token,        
      }
    })         
  }
  UpdateSetting(field, status) {
    return axios.post(`${environment.api_url}api/v1/users/updatesetting`,  { field: field, status:status},
    {
      headers: {
        'Authorization': 'Bearer ' + this.userData.token,        
      }
    }) 
  }
  UpdateEmail(email, password) {
    return axios.post(`${environment.api_url}api/v1/users/updatesetting`,  {email: email, password: password},
    {
      headers: {
        'Authorization': 'Bearer ' + this.userData.token,        
      }
    }) 
  }
  updateTfaData(tfa) {   
    return axios.post(`${environment.api_url}api/v1/users/updatetfa`, tfa,
    {
      headers: {
        'Authorization': 'Bearer ' + this.userData.token,        
      }
    }) 
  }
  
  SignIn(email, password) {
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password)
      // .then((result) => {
      //   this.ngZone.run(() => {
      //     this.router.navigate(['dashboard']);
      //   });
      //   this.SetUserData(result.user);
      // }).catch((error) => {
      //   window.alert(error.message)
      // })
  }
  
  SignUp(email, password) {    
    return this.firebaseAuth.auth.createUserWithEmailAndPassword(email, password)
  }
  
  SendVerificationMail() {
    return this.firebaseAuth.auth.currentUser.sendEmailVerification()    
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail) {
    return this.firebaseAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      //window.alert('Password reset email sent, check your inbox.');
    }).catch((error) => {
      console.log('ForgotPassword error:' + error.message)
    })
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

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.firebaseAuth.auth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  GetLocalUserData():any{
    
    if (!this.userData){
      let data = localStorage.getItem('user');
      this.userData = JSON.parse(data);  
      console.log('get from localstorage')  
    } else {
      console.log('get from userData')  
      return this.userData
    }
   
    return this.userData
  }
  SetLocalUserData(){
    if (this.userData){
      localStorage.setItem('user', JSON.stringify(this.userData));       
    }    
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

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
    console.log('SetUserData ')
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);        
    return userRef.set(user, {
      merge: true
    })
  }
  
  
 
  
  // Sign out 
  SignOut() {
    
    localStorage.removeItem('user');    
    this.userData = null  
    this.ngZone.run(()=> {
      this.router.navigateByUrl('/login')
      // return this.firebaseAuth.auth.signOut().then(() => {
      //   console.log('SignOut')
      //   localStorage.removeItem('user');
      //   this.userData = null  
      // }).catch(err =>{
      //   console.log('Err:', err)
      // })
    })
  }

}