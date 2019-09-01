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
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    // this.afAuth.authState.subscribe(user => {
    //   console.log("auth.service-afAuth.authState.subscribe-localStorage.getItem():", localStorage.getItem('user'))
    //   if (user) {       
    //     const data: User = {
    //       uid: user.uid,
    //       email: user.email,
    //       displayName: user.displayName,
    //       photoURL: user.photoURL,
    //       emailVerified: user.emailVerified
    //     }
    //     this.userData = data; 
    //     console.log("auth.service-afAuth.authState.subscribe-userData", data)       
    //     //localStorage.setItem('user', JSON.stringify(this.userData));
    //     //JSON.parse(localStorage.getItem('user'));
    //   } else {
    //     localStorage.setItem('user', null);
    //     //JSON.parse(localStorage.getItem('user'));
    //   }
    // })
  }
  
  // getAuth(account:string) {
  //   return this.http.get("http://127.0.0.1:5555/tfa/setup", { observe: 'response' });
  // }
  setupTfa(account:string) {
    return this.http.get("https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/TfaSetup?account=" + account, { observe: 'response' });
  }

  // deleteTfa() {
  //   return this.http.delete("http://127.0.0.1:5555/tfa/disable", { observe: 'response' });
  // }

  verifyTfaAuth(token: any, secret: any) {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type':  'application/json',
    //     'Access-Control-Allow-Origin': '*'
    //   })
    // };
    let url = `https://us-central1-grayll-app-f3f3f3.cloudfunctions.net/VerifyToken?token=${token}&secret=${secret}`
    return this.http.get(url, { observe: 'response' });
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

  GetLocalUserData(){
    if (!this.userData){
      let data = localStorage.getItem('user');
      this.userData = JSON.parse(data);  
      console.log('get from localstorage')  
    } else {
      console.log('get from userData')  
      return this.userData
    }
    //return null
  }
  SetLocalUserData(){
    if (this.userData){
      localStorage.setItem('user', JSON.stringify(this.userData));       
    }    
  }
  
  SetLocalTfa(tfa){
    if (tfa){
      localStorage.setItem('tfa', JSON.stringify(tfa));       
    }    
  }
  GetLocalTfa(){
    let data = localStorage.getItem('tfa');
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
  UpdateTfaData(data) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${data.Uid}`);        
    return userRef.update({Tfa: data.Tfa})
  }
  UpdateSetting(uid, data) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${uid}`);        
    return userRef.update({UserSetting: data})
  }
  UpdateEmail(uid, email) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${uid}`);        
    return userRef.update({Email: email})
  }
  GetUserData1(uid) {    
    const document: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`)
    const document$: Observable<User> = document.valueChanges()
    return document$
  }
  
  // Sign out 
  SignOut() {
    
    localStorage.removeItem('user');    
    this.userData = null  
    this.ngZone.run(()=> {
      return this.firebaseAuth.auth.signOut().then(() => {
        console.log('SignOut')
        localStorage.removeItem('user');    
        this.userData = null  
      }).catch(err =>{
        console.log('Err:', err)
      })
    })
  }

}