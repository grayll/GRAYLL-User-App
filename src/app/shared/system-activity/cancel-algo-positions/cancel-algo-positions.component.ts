import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
import { AlgoService } from 'src/app/system/algo.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { environment } from 'src/environments/environment';
import { Observable, forkJoin, from, Subscription } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-cancel-algo-positions',
  templateUrl: './cancel-algo-positions.component.html',
  styleUrls: ['./cancel-algo-positions.component.css']
})
export class CancelAlgoPositionsComponent implements OnInit {
  
  @ViewChild('content') modal;
  algoName: any = '';
  subs: Subscription
  constructor(
    public popupService: PopupService,
    private algoService: AlgoService,
    private authService: AuthService,
    private http: HttpClient,
    private loadingService: LoadingService,
     private route: ActivatedRoute,
  ) { }
  
  ngOnInit() {
    this.popupService.open(this.modal);
    this.route.params.subscribe((param) => {
      let params = param.name;
      let index = params.indexOf("GR");
      this.algoName = params.substring(index, params.length);
    })
    this.subs = this.authService.subCloseAllEnd().subscribe( end => {
      this.algoService.closingAllAlgo = ''
      this.closePopup()
    })
    this.algoService.closingAllAlgo = ''
  }
  
  closeAll(){
    if (this.algoService.openPositions.length == 0){
      this.popupService.close()
      return
    }
    this.loadingService.show()
    let grzusd = this.authService.priceInfo.grzusd
    let grxusd = this.authService.priceInfo.grxusd
    let gryusd = this.authService.priceInfo.gryusd

    let closePositionsData = []
    let closePositionsDataGry1 = []
    let closePositionsDataGry2 = []
    let closePositionsDataGry3 = []
    
    this.algoService.openPositions.forEach( position => {      
      // if (position.algorithm_type === 'GRZ'){ 
       
      //   let close_position_total_$ = position.open_position_value_$ * ((((grzusd - position.open_value_GRZ)/position.open_value_GRZ) / 1.00) + 1)
      
      //   let close_position_fee_$ = close_position_total_$*0.003
      //   let close_position_ROI_$ = close_position_total_$ - position.open_position_value_$       

      //   let close_performance_fee_$ = 0
      //   let netRoi = close_position_ROI_$ - close_position_fee_$
      //   if (netRoi > 0) {
      //     close_performance_fee_$ =  netRoi * 0.18
      //   }

      //   let close_position_total_GRX = close_position_total_$/grxusd
      //   let close_position_value_$ = close_position_total_$ - close_position_fee_$ - close_performance_fee_$
      //   let close_position_ROI_percent = (grzusd - position.open_value_GRZ)*100/position.open_value_GRZ
        
      //   let close_position_ROI_percent_NET = ((close_position_value_$-position.open_position_value_$)*100)/position.open_position_value_$  
      //   //==
        
      //   let positionData = 
      //   {  user_id: this.authService.userInfo.Uid,            
      //     open_stellar_transaction_id: position.open_stellar_transaction_id,
      //     open_position_timestamp: position.open_position_timestamp,
      //     grayll_transaction_id: position.grayll_transaction_id,        
      //     algorithm_type: position.algorithm_type,
          
      //     close_value_GRX:              grxusd,
      //     close_value_GRZ:              grzusd,

      //     close_position_value_$:       close_position_value_$,
      //     close_position_value_GRX:     close_position_value_$/grxusd,
      //     close_position_ROI_$:         close_position_ROI_$,
      //     close_position_ROI_percent:   close_position_ROI_percent,
      //     close_position_ROI_percent_NET:   close_position_ROI_percent_NET,
      //     current_position_ROI_$:       close_position_ROI_$,
      //     current_position_ROI_percent: close_position_ROI_percent,
      //     close_position_total_$:    close_position_total_$,
      //     close_position_total_GRX:  close_position_total_GRX,
      //     close_position_total_GRZ:   close_position_total_$/grzusd,
      //     close_position_fee_$:      close_position_fee_$,
      //     close_position_fee_GRX:      close_position_fee_$/grxusd,
      //     close_performance_fee_$:   close_performance_fee_$,
      //     close_performance_fee_GRX: close_performance_fee_$/grxusd 
      //   } 
      //   closePositionsData.push(positionData)
        
      // } else {
        // let data = {
        //   // user_id: this.authService.userInfo.Uid,   
        //   // open_position_value_$:position.open_position_value_$,         
        //   // open_stellar_transaction_id: position.open_stellar_transaction_id,
        //   // open_position_timestamp: position.open_position_timestamp,
        //   grayll_transaction_id: position.grayll_transaction_id,        
        //   // algorithm_type: position.algorithm_type,          
        //   // close_value_GRX:              grxusd,
        //   // close_value_GRY:              gryusd,          
        // }
        
        switch(position.algorithm_type){
          case "GRZ":
            closePositionsData.push(position.grayll_transaction_id)
            break
          case "GRY 1":            
            closePositionsDataGry1.push(position.grayll_transaction_id)
            break
          case "GRY 2":           
            closePositionsDataGry2.push(position.grayll_transaction_id)
            break
          case "GRY 3":           
            closePositionsDataGry3.push(position.grayll_transaction_id)
            break
        }       
     // }       
    })   

    

    // let postDatas = []
    
    // if (closePositionsData.length > 0) {      
    //   this.algoService.closeAll = true
    //   postDatas.push({url:environment.grz_api_url + 'api/v1/grz/position/closeAll',data: {action:"CLOSEALL", data: closePositionsData}})
    // }  
    // if (closePositionsDataGry1.length > 0) {      
    //   this.algoService.closeAll = true
    //   postDatas.push({url:environment.gry1_api_url + 'api/v1/gry/position/closeAll',data: {action:"CLOSEALL", data: closePositionsDataGry1}})
    // }  
    // if (closePositionsDataGry2.length > 0) {      
    //   this.algoService.closeAll = true
    //   postDatas.push({url:environment.gry2_api_url + 'api/v1/gry/position/closeAll', data:{action:"CLOSEALL", data: closePositionsDataGry2}})
    // }  
    // if (closePositionsDataGry3.length > 0) {      
    //   this.algoService.closeAll = true
    //   postDatas.push({url:environment.gry3_api_url + 'api/v1/gry/position/closeAll', data:{action:"CLOSEALL", data: closePositionsDataGry3}})
    // } 
      
      switch (this.algoName) {
        case 'GRZ':
          if (closePositionsData.length > 0){
            this.algoService.closingAllAlgo = this.algoName
            this.http.post(environment.grz_api_url + 'api/v1/grz/position/closeAll', {grayllTxs: closePositionsData}).subscribe(
              res => { 
                if ((res as any).errCode != environment.SUCCESS){
                  this.closePopup()
                }
              },
                err => { this.closePopup(); console.log(err)}     
            );
          } else {
            this.closePopup()
          }
          break
        case 'GRY 1':
          if (closePositionsDataGry1.length > 0){
            this.algoService.closingAllAlgo = this.algoName
            this.http.post(environment.gry1_api_url + 'api/v1/gry/position/closeAll', {grayllTxs: closePositionsDataGry1}).subscribe(
              res => { 
                if ((res as any).errCode != environment.SUCCESS){
                  this.closePopup()
                }
              },
                err => { this.closePopup(); console.log(err)}     
            );
          } else {
            this.closePopup()
          }
          break
        case 'GRY 2':
          if (closePositionsDataGry2.length > 0){
            this.algoService.closingAllAlgo = this.algoName
            this.http.post(environment.gry2_api_url + 'api/v1/gry/position/closeAll', {grayllTxs: closePositionsDataGry2}).subscribe(
              res => { 
                if ((res as any).errCode != environment.SUCCESS){
                  this.closePopup()
                }
              },
                err => { this.closePopup(); console.log(err)}     
            );
          } else {
            this.closePopup()
          }
          break
        case 'GRY 3':
          if (closePositionsDataGry3.length > 0){
            this.algoService.closingAllAlgo = this.algoName
            this.http.post(environment.gry3_api_url + 'api/v1/gry/position/closeAll', {grayllTxs: closePositionsDataGry3}).subscribe(
              res => { 
                if ((res as any).errCode != environment.SUCCESS){
                  this.closePopup()
                }
              },
                err => { this.closePopup(); console.log(err)}     
            );
          } else {
            this.closePopup()
          }
          break
      }
  }
  closePopup(){
    this.loadingService.hide()
    this.popupService.close()
    if (this.subs){
      this.subs.unsubscribe()
    }
  }

}
