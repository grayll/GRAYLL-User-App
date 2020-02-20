/** Angular imports */
// import { Injectable } from "@angular/core";

// /** 3rd-party imports */
// import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database'
// import { _firebaseAppFactory } from "@angular/fire/firebase.app.module";
// import { FirebaseAppConfig } from "angularfire2";

// @Injectable()
// export class FirebaseService {
//     private _db: AngularFireDatabase;

//     constructor() { }

//     /** Function to initialize firebase application and
//      * get DB provider for the corresponding application.
//      */
//     public initFirebaseApp(config: FirebaseAppConfig, firebaseAppName: string) {
//         this._db = new AngularFireDatabase(_firebaseAppFactory(config, firebaseAppName));
//     }

//     /** Function to get firebase DB list */
//     public getList(path: string): AngularFireList<{}> {
//         return this._db.list(path);
//     }

//     /** Function to get firebase DB object */
//     public getObject(path: string): AngularFireObject<{}> {
//         return this._db.object(path);
//     }
// }

// export class MyApp {
//     constructor(private afW: AngularFireWrapper) {
  
//       this.afW.object('test')
//         .valueChanges()
//         .subscribe(console.log)
//       // => output default db values
  
//       this.afW.db('otherDb').object('test')
//         .valueChanges()
//         .subscribe(console.log)
//       // => output otherDb values
//     }


import { environment } from 'src/environments/environment';
import { AngularFireDatabase, AngularFireObject, AngularFireList, QueryFn } from '@angular/fire/database';
import { Injectable, Optional } from '@angular/core';
import * as firebase from 'firebase/app';

@Injectable()
export class AngularFireWrapper {

  // Default database 
  private _firebaseDb = this.afDb.database;

  constructor(private afDb: AngularFireDatabase, @Optional() dbName: string) {

    console.log('Hello AngularFireWrapper, db :', dbName || 'default');

    // 1st Method, same project, same auth
    // environment.dbUrls = {
    //   ...
    //   otherDb: 'https://DB_NAME_SAME_PROJECT.firebaseio.com/'
    // }

    // if (dbName && environment.dbUrls[dbName]) {
    //   const app: any = this.afDb.app;
    //   this._firebaseDb = app.database(environment.dbUrls[dbName]);
    // }

    // 2nd Method, other project, different auth =/
    // environment.dbConfigs = {
    //   ...
    //   otherDb: {...} // usual firebase configs 
    // }
    console.log('environment.dbs[dbName]', environment.dbs[dbName])

    if (dbName && environment.dbs[dbName]) {
      this._firebaseDb = firebase.initializeApp(environment.dbs[dbName], dbName).database();
    }
  }

  db(dbName): AngularFireWrapper {
    return new AngularFireWrapper(this.afDb, dbName);
  }

  object(path: string): AngularFireObject<any> {
    const ref = this._firebaseDb.ref(path);
    return this.afDb.object(ref);
  }

  list(path: string, queryFn?: QueryFn): AngularFireList<any> {
    const ref = this._firebaseDb.ref(path);
    return this.afDb.list(ref, queryFn);
  }
}