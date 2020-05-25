import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
import { AlgoService } from 'src/app/system/algo.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { environment } from 'src/environments/environment';
import { Observable, forkJoin, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-cancel-algo-positions',
  templateUrl: './cancel-algo-positions.component.html',
  styleUrls: ['./cancel-algo-positions.component.css']
})
export class CancelAlgoPositionsComponent implements OnInit {
  
  @ViewChild('content') modal;
  
  constructor(
    public popupService: PopupService,
    private algoService: AlgoService,
    private authService: AuthService,
    private http: HttpClient,
    private loadingService: LoadingService,
  ) { }
  
  ngOnInit() {
    this.popupService.open(this.modal);
    this.authService.subCloseAllEnd().subscribe( end => {
      this.loadingService.hide()
      this.popupService.close()
    })
  }
  
  closeAll(){
    this.loadingService.show()
    let grzusd = this.authService.priceInfo.grzusd
    let grxusd = this.authService.priceInfo.grxusd
    let gryusd = this.authService.priceInfo.gryusd

    let closePositionsData = []
    let closePositionsDataGry1 = []
    let closePositionsDataGry2 = []
    let closePositionsDataGry3 = []
    let urls = []

    this.algoService.openPositions.forEach( position => {
      if (position.algorithm_type === 'GRZ'){ 
        //==
        let close_position_total_$ = position.open_position_value_$ * ((((grzusd - position.open_value_GRZ)/position.open_value_GRZ) / 1.00) + 1)
      
        let close_position_fee_$ = close_position_total_$*0.003
        let close_position_ROI_$ = close_position_total_$ - position.open_position_value_$       

        let close_performance_fee_$ = 0
        let netRoi = close_position_ROI_$ - close_position_fee_$
        if (netRoi > 0) {
          close_performance_fee_$ =  netRoi * 0.18
        }

        let close_position_total_GRX = close_position_total_$/grxusd
        let close_position_value_$ = close_position_total_$ - close_position_fee_$ - close_performance_fee_$
        let close_position_ROI_percent = (grzusd - position.open_value_GRZ)*100/position.open_value_GRZ
        
        let close_position_ROI_percent_NET = ((close_position_value_$-position.open_position_value_$)*100)/position.open_position_value_$  
        //==
        
        let positionData = 
        {  user_id: this.authService.userInfo.Uid,            
          open_stellar_transaction_id: position.open_stellar_transaction_id,
          open_position_timestamp: position.open_position_timestamp,
          grayll_transaction_id: position.grayll_transaction_id,        
          algorithm_type: position.algorithm_type,
          
          close_value_GRX:              grxusd,
          close_value_GRZ:              grzusd,

          close_position_value_$:       close_position_value_$,
          close_position_value_GRX:     close_position_value_$/grxusd,
          close_position_ROI_$:         close_position_ROI_$,
          close_position_ROI_percent:   close_position_ROI_percent,
          close_position_ROI_percent_NET:   close_position_ROI_percent_NET,
          current_position_ROI_$:       close_position_ROI_$,
          current_position_ROI_percent: close_position_ROI_percent,
          close_position_total_$:    close_position_total_$,
          close_position_total_GRX:  close_position_total_GRX,
          close_position_total_GRZ:   close_position_total_$/grzusd,
          close_position_fee_$:      close_position_fee_$,
          close_position_fee_GRX:      close_position_fee_$/grxusd,
          close_performance_fee_$:   close_performance_fee_$,
          close_performance_fee_GRX: close_performance_fee_$/grxusd 
        } 
        closePositionsData.push(positionData)
        
      } else {
        let data = {user_id: this.authService.userInfo.Uid,   
          open_position_value_$:position.open_position_value_$,         
          open_stellar_transaction_id: position.open_stellar_transaction_id,
          open_position_timestamp: position.open_position_timestamp,
          grayll_transaction_id: position.grayll_transaction_id,        
          algorithm_type: position.algorithm_type,          
          close_value_GRX:              grxusd,
          close_value_GRY:              gryusd,          
        }
        
        switch(position.algorithm_type){
          case "GRY 1":
            
            closePositionsDataGry1.push(data)
            break
          case "GRY 2":
           
            closePositionsDataGry2.push(data)
            break
          case "GRY 3":
           
            closePositionsDataGry3.push(data)
            break
        }       
      }       
    })   

    

    let postDatas = []
    
    if (closePositionsData.length > 0) {      
      this.algoService.closeAll = true
      postDatas.push({url:environment.grz_api_url + 'api/v1/grz/position/closeAll',data: {action:"CLOSEALL", data: closePositionsData}})
    }  
    if (closePositionsDataGry1.length > 0) {      
      this.algoService.closeAll = true
      postDatas.push({url:environment.gry1_api_url + 'api/v1/gry/position/closeAll',data: {action:"CLOSEALL", data: closePositionsDataGry1}})
    }  
    if (closePositionsDataGry2.length > 0) {      
      this.algoService.closeAll = true
      postDatas.push({url:environment.gry2_api_url + 'api/v1/gry/position/closeAll', data:{action:"CLOSEALL", data: closePositionsDataGry2}})
    }  
    if (closePositionsDataGry3.length > 0) {      
      this.algoService.closeAll = true
      postDatas.push({url:environment.gry3_api_url + 'api/v1/gry/position/closeAll', data:{action:"CLOSEALL", data: closePositionsDataGry3}})
    } 
    if (this.algoService.closeAll){
      from(postDatas).pipe(
        concatMap(postData => 
          this.http.post(postData.url, postData.data)
        )
      ).subscribe(
        res => { console.log(res)},
          err => { console.log(err)}     
      );
    }
    // if (this.algoService.closeAll){
    //   forkJoin(postData).subscribe(results => {
    //     this.loadingService.hide()
    //     console.log(results)
    //     // results[0] is our character
    //     // results[1] is our character homeworld
    //     //results[0].homeworld = results[1];
    //     //this.loadedCharacter = results[0];
    //   }, e => {
    //     this.loadingService.hide()
    //   });
    // }

    // if (closePositionsData.length > 0) {
    //   //console.log('closePositionsData:', closePositionsData)
    //   this.algoService.closeAll = true
    //   this.http.post(environment.grz_api_url + 'api/v1/grz/position/closeAll', {action:"CLOSEALL", data: closePositionsData}).subscribe(
    //     res => {
    //       this.loadingService.hide()         
    //     },
    //     e => {
    //       this.loadingService.hide() 
    //     }
    //   )
    // }  
    // if (closePositionsDataGry1.length > 0) {      
    //   this.algoService.closeAll = true
    //   this.http.post(environment.gry1_api_url + 'api/v1/gry/position/closeAll', {action:"CLOSEALL", data: closePositionsDataGry1}).subscribe(
    //     res => {
    //       this.loadingService.hide()        
    //     },
    //     e => {
    //       this.loadingService.hide()
    //     }
    //   )
    // }  
    // if (closePositionsDataGry2.length > 0) {      
    //   this.algoService.closeAll = true
    //   this.http.post(environment.gry2_api_url + 'api/v1/gry/position/closeAll', {action:"CLOSEALL", data: closePositionsDataGry2}).subscribe(
    //     res => {
    //       this.loadingService.hide()         
    //     },
    //     e => {
    //       this.loadingService.hide()
    //     }
    //   )
    // }  
    // if (closePositionsDataGry3.length > 0) {      
    //   this.algoService.closeAll = true
    //   this.http.post(environment.gry3_api_url + 'api/v1/gry/position/closeAll', {action:"CLOSEALL", data: closePositionsDataGry3}).subscribe(
    //     res => {
    //       this.loadingService.hide()          
    //     },
    //     e => {
    //       this.loadingService.hide()
    //     }
    //   )
    // } 

  }

}
