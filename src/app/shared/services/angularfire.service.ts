import { environment } from 'src/environments/environment';
import { AngularFireDatabase, AngularFireObject, AngularFireList, QueryFn } from '@angular/fire/database';
import { Injectable, Optional } from '@angular/core';
import * as firebase from 'firebase/app';

@Injectable()
export class AngularFireWrapper {

  // Default database 
  private _firebaseDb = this.afDb.database;

  constructor(private afDb: AngularFireDatabase, @Optional() dbName: string) {

    //console.log('Hello AngularFireWrapper, db :', dbName || 'default');

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
    // console.log('environment.dbs[dbName]', environment.dbs[dbName])

    // if (dbName && environment.dbs[dbName]) {
    //   this._firebaseDb = firebase.initializeApp(environment.dbs[dbName], dbName).database();
    // }
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