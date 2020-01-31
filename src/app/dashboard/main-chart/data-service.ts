import { Injectable, ɵConsole } from '@angular/core';
import { Observable, interval, of, BehaviorSubject } from 'rxjs';
import { PriceData, TimePrice } from './data-model';
import { flatMap, startWith } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  coinIndex = 1
  // frameIndex should be 5, 15, 30...
  //frameIndex = 1440
  frameIndex = 240
  timeFrameChanged$ = new BehaviorSubject<number>(this.frameIndex);
  coinChanged$ = new BehaviorSubject<number>(this.coinIndex);

  dashboardData$ = new BehaviorSubject<any>({})
  frameData$ = new BehaviorSubject<any>({})
  constructor(private http: HttpClient) {}

  getRealTimeData(){
    return this.frameData$.value
  }

  setRealtimeData(value){
    return this.frameData$.next(value)
  }

  getDbData(){
    return this.dashboardData$.value
  }
  setDbData(value:any){
    this.dashboardData$.next(value)
  }
 
  // loadTrade(coinIndex: number, frmIndex: number, limit:number): Observable<PriceData[]> {
  //   //console.log('loadTrade-timeFrame:', coinIndex, frmIndex);
  //   var coinDoc = this.getCoinDocName(coinIndex)
  //   if (coinIndex != 0) {
  //     coinDoc = this.getCoinDocName(this.coinIndex)
  //   }
  //    return interval(60000 * frmIndex).pipe(
  //     flatMap((time) => this.getFrameData(limit, coinDoc, this.getFrameName(this.frameIndex)))
  //   );
  // }
  // getNextValue(coinIndex: number, frmIndex:number,limit:number): Observable<PriceData[]> {
  //   console.log('getNextValue-frmIndex:', coinIndex, frmIndex, this.getCoinDocName(coinIndex), this.getFrameName(this.frameIndex));
  //   return this.getFrameData(limit, this.getCoinDocName(coinIndex), this.getFrameName(this.frameIndex))
  // }

  // getFrameData(limit:number, coin:string, frame:string): Observable<PriceData[]> {       
  //   return this.http.post<PriceData[]>("https://us-central1-grayll-mvp.cloudfunctions.net/GetFrameData",
  //   {
  //     "Limit":limit, "Coin":coin, "Frame":frame
  //   });    
  // }
  // runDataFrames(limit:number, coins:string, frame:string):Observable<any>{
  //   //console.log('runDataFrames', this.frameIndex, coins, frame)
  //   return interval(60000 * this.frameIndex).pipe(
  //     flatMap(() => this.getFramesData(limit, coins, frame))
  //   );
  // }
  getFramesData(limit:number, coins:string, frame:string):Observable<any> {            
    return this.http.get(`api/v1/users/GetFramesDataGet/${limit}/${coins}/${frame}`)
  }
  // runGetDataFrames(limit:number, coins:string, frame:string){
  //   setInterval(()=> {
  //     //console.log('runGetDataFrames')
  //     var params = {"Limit":limit, "Coins":coins, "Frame":frame}
  //     if (coins === ""){
  //       var coinlist = "grzusd," + this.getCoinDocName(this.coinIndex)
  //       var frameName = this.getFrameName(this.frameIndex)
  //       params = {"Limit":limit, "Coins": coinlist, "Frame":frameName}
  //     }

  //     console.log('runGetDataFrames- params: ', params)
  //     this.http.post("https://us-central1-grayll-mvp.cloudfunctions.net/GetFramesDataGrz",
  //     {
  //       params
  //     }).subscribe(
  //       data => {
  //         // set frame data behaviorObject
  //         this.setRealtimeData(data)
  //         //console.log('getFramesData', data)
  //       },
  //       error => {
  //         console.log('getFramesData - error: ', error)
  //       }
  //   )}, this.frameIndex*60000)
  // }
  
  
  runDashboardService(frame:string){
    //var frame = this.getFrameName(this.frameIndex)    
    this.http.post("https://us-central1-grayll-mvp.cloudfunctions.net/GetDashBoardDataGrz",
    {
      "Frame":frame
    }).subscribe(
    data  => {
      this.setDbData(data)      
    },
      error  => {
        console.log("Error", error);
      }
    )

    setInterval(()=> {this.http.post("https://us-central1-grayll-mvp.cloudfunctions.net/GetDashBoardDataGrz",
    {
      "Frame":frame
    }).subscribe(
    data  => {
      this.setDbData(data)
      //console.log("Dashboard data: ", data);     
    },
      error  => {
        console.log("Error", error);
      }
    )}, 60000)    
  }
  


}
