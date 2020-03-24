import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { NoticeId, Notice, Order, OrderId } from './notification.model';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as moment from 'moment'
import { AuthService } from '../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class NoticeDataService {

  private _data: BehaviorSubject<NoticeId[]>;
  public data: Observable<NoticeId[]>;
  public dataPaymentsSync: NoticeId[];

  private _algoData: BehaviorSubject<NoticeId[]>;
  public algoData: Observable<NoticeId[]>;

  private _generalData: BehaviorSubject<NoticeId[]>;
  public generalData: Observable<NoticeId[]>;
  
  private _dataTrade: BehaviorSubject<OrderId[]>;
  public dataTrade: Observable<OrderId[]>;
  public dataTradeSync: OrderId[];
  
  private _markAsRead: Subject<any>

  latestEntry: any;
  latestEntryGeneral:any
  latestEntryAlgo:any
  latestEntryTrade: any;
  txUrl:string
  
  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    ) {
    let url = 'https://stellar.expert/explorer/public/'
    if (environment.horizon_url.includes('testnet')){
      url = 'https://stellar.expert/explorer/testnet/'
    }
    url = url + 'search?term='
    this.txUrl = url
    this._markAsRead = new Subject<{}>()
  }

  pushMarkRead(value:any){
    this._markAsRead.next(value)
  }
  subsMarkRead():Observable<any>{
    if (this._markAsRead){
      return this._markAsRead.asObservable()
    }
  }

  // You need to return the doc to get the current cursor.
  getCollection(ref, queryFn?): Observable<any[]> {
    //return this.afs.collection(ref, queryFn).snapshotChanges().pipe(
    return this.afs.collection(ref, queryFn).snapshotChanges(['added']).pipe(
      map(actions => actions.map(a => {
        //const data = a.payload.doc.data();
        const data = a.payload.doc.data() as Notice;
        const id = a.payload.doc.id;
        const doc = a.payload.doc;
        let times = moment(a.payload.doc.data()["time"]*1000).format('HH:mm | DD/MM/YYYY')
        //console.log('id', id)
        if (a.payload.doc.data()["txId"]){
          let url = this.txUrl + a.payload.doc.data()["txId"]
          return { id, doc, url, times, ...data };
        } else {          
          return { id, doc, times, ...data };
        }       
      }))
    );
  }
  getCollActivity(ref, queryFn?): Observable<any[]> {
    //return this.afs.collection(ref, queryFn).snapshotChanges().pipe(
    return this.afs.collection(ref, queryFn).snapshotChanges(['added']).pipe(
      map(actions => actions.map(a => {
        
        //console.log('a.payload.doc.data():', a.payload.doc.data())
        const data = a.payload.doc.data() as Notice;
        const id = a.payload.doc.id;
        const doc = a.payload.doc;
        //let times = moment(a.payload.doc.data()["time"]*1000).format('HH:mm | DD/MM/YYYY')
        let times =  moment.utc(a.payload.doc.data()["time"]*1000).local().format('DD/MM/YYYY HH:mm:ss')
        let issuer = 'Stellar'
        if (a.payload.doc.data()["asset"].includes('GRX')){
          issuer = 'GRAYLL'
        }
        let url = this.txUrl + a.payload.doc.data()["txId"]
        let counters = this.trimAddress(a.payload.doc.data()["counter"])
       
        return { id, doc, url, counters, times, ...data };     

      }))
    );
  }

  parseTransfer(notice){
    let data = notice as Notice;
        const id = notice.id;
        
        //let times = moment(a.payload.doc.data()["time"]*1000).format('HH:mm | DD/MM/YYYY')
        let times =  moment.utc(notice.time*1000).local().format('DD/MM/YYYY HH:mm:ss')
        // let issuer = 'Stellar'
        // if (notice.asset.includes('GRX')){
        //   issuer = 'GRAYLL'
        // }
        let url = this.txUrl + notice.txId
        let counters = this.trimAddress(notice.counter)
        //console.log('a.payload.doc.data():', a.payload.doc.data())
        return { id, url, counters, times, ...data };     
  }
  getPaymentHistory(path:string, limit:number) {
    this._data = new BehaviorSubject([]);
    //this.data = this._data.asObservable().subscribe(res => this.allData.push(res));
    this.data = this._data.asObservable()
  
    const scoresRef = this.getCollActivity(path, ref => ref
      .orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        if (data.length && data.length > 0){
          this.latestEntry = data[data.length - 1].doc;   
          this.dataPaymentsSync = data      
          this._data.next(data);
        }
    });
  }

  getTrades(ref, queryFn?): Observable<any[]> {   
    return this.afs.collection(ref, queryFn).snapshotChanges(['added']).pipe(
      map(actions => actions.map(a => {        
        const data = a.payload.doc.data() as OrderId;       
        //let times = moment(a.payload.doc.data()["time"]*1000).format('HH:mm | DD/MM/YYYY')
        let ts = a.payload.doc.data()["time"]
        let times
        if (isNaN(ts)){
          times =  moment.utc(ts.seconds*1000).local().format('DD/MM/YYYY HH:mm:ss')
        }  else {
          times =  moment.utc(ts*1000).local().format('DD/MM/YYYY HH:mm:ss')
        }  
        //let times =  moment.utc(ts.seconds*1000).local().format('DD/MM/YYYY HH:mm:ss')
        
        let url = this.txUrl + a.payload.doc.data()["offerId"]        
        //console.log('a.payload.doc.data():', a.payload.doc.data())
        return { url, times, ...data };     

      }))
    );
  }

  parseTrade(trade){
    const data = trade as OrderId; 
    let times
    if (isNaN(trade.time)){
      times =  moment.utc(trade.time.seconds*1000).local().format('DD/MM/YYYY HH:mm:ss')
    }  else {
      times =  moment.utc(trade.time*1000).local().format('DD/MM/YYYY HH:mm:ss')
    }  
    
    let url = this.txUrl + trade.offerId        
    return { url, times, ...data };     
  }
  
  getTradeHistory(path:string, limit:number) {
    this._dataTrade = new BehaviorSubject([]);    
    this.dataTrade = this._dataTrade.asObservable()
   
    const scoresRef = this.getTrades(path, ref => ref
      .orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        console.log('trade data:', data)
        if (data.length && data.length > 0){
          this.latestEntryTrade = data[data.length - 1].doc; 
          this.dataTradeSync = data       
          this._dataTrade.next(data);
          if (this.authService.reload){
            this.authService.pushShouldReload(true)
          } else {
           this.authService.reload = true
          }
        }
    });
  }

  trimAddress(pk){
    return pk.slice(0, 6) + '...' + pk.slice( pk.length-7, pk.length-1)
  }
  async markAsRead(collPath:string, id:string){
    await this.afs.doc(collPath+ '/' + id).set({isRead:true}, {merge : true})
  }
  // In your first query you subscribe to the collection and save the latest entry
  first(path:string, limit:number) {
    this._data = new BehaviorSubject([]);
    //this.data = this._data.asObservable().subscribe(res => this.allData.push(res));
    this.data = this._data.asObservable()

    const scoresRef = this.getCollection(path, ref => ref
      .orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        if (data.length && data.length > 0){
          this.latestEntry = data[data.length - 1].doc;       
          this._data.next(data);
        }
      }); 
  }

  firstGeneral(path:string, limit:number) {
    this._generalData = new BehaviorSubject([]);
    //this.data = this._data.asObservable().subscribe(res => this.allData.push(res));
    this.generalData = this._generalData.asObservable()
  
    const scoresRef = this.getCollection(path, ref => ref
      .orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        if (data.length && data.length > 0){
          this.latestEntryGeneral = data[data.length - 1].doc;
          //console.log(data[data.length - 1].doc.data())
          this._generalData.next(data);
        }
      });
  }
  firstAlgo(path:string, limit:number) {
    this._algoData = new BehaviorSubject([]);
    //this.data = this._data.asObservable().subscribe(res => this.allData.push(res));
    this.algoData = this._algoData.asObservable()
  
    const scoresRef = this.getCollection(path, ref => ref
      .orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        if (data.length && data.length > 0){
          this.latestEntryAlgo = data[data.length - 1].doc;
          //console.log(data[data.length - 1].doc.data())
          this._algoData.next(data);
        }
      });
  }

  firstAlgoType(path:string, limit:number, type:string) {
    this._algoData = new BehaviorSubject([]);
    //this.data = this._data.asObservable().subscribe(res => this.allData.push(res));
    this.algoData = this._algoData.asObservable()
  
    const scoresRef = this.getCollection(path, ref => ref
      .where('type', '==', type)
      //.orderBy('time', 'desc')
      .limit(limit))
      .subscribe(data => {
        if (data.length && data.length > 0){
          this.latestEntryAlgo = data[data.length - 1].doc;
          //console.log(data[data.length - 1].doc.data())
          this._algoData.next(data);
        }
      });
  }

  next(path:string, limit:number) {
    const scoresRef = this.getCollection(path, ref => ref
      .orderBy('time', 'desc')
       // Now you can use the latestEntry to query with startAfter
      .startAfter(this.latestEntry)
      .limit(limit))
      .subscribe(data => {
        if (data.length) {
          // And save it again for more queries
          this.latestEntry = data[data.length - 1].doc;
          this._data.next(data);          
        }
      });
  }
}
