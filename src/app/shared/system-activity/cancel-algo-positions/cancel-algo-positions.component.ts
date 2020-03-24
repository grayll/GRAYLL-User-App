import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../popup/popup.service';
import { AlgoService } from 'src/app/system/algo.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { environment } from 'src/environments/environment';

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

    this.algoService.openPositions.forEach( position => {
      if (position.algorithm_type === 'GRZ'){        
        let close_position_total_$ = position.open_position_value_$ + (grzusd - position.open_value_GRZ)*position.open_position_value_$/position.open_value_GRZ
        let close_position_fee_$ = close_position_total_$*0.003
        let close_position_ROI_$ = close_position_total_$  - position.open_position_value_$
        let close_performance_fee_$ = 0
        if (close_position_ROI_$ - close_position_fee_$ > 0) {
          close_performance_fee_$ =  (close_position_ROI_$ - close_position_fee_$ ) * 0.18
        }
  
        let close_position_total_GRX = close_position_total_$/grxusd
        let close_position_value_$ = close_position_total_$ - close_position_fee_$ - close_performance_fee_$
        let close_position_ROI_percent_GROSS = close_position_ROI_$*100/position.open_position_value_$
        let close_position_ROI_percent_NET = (close_position_value_$  - position.open_position_value_$)*100/position.open_position_value_$      
        
        let positionData = {  user_id: this.authService.userInfo.Uid,            
          open_stellar_transaction_id: position.open_stellar_transaction_id,
          open_position_timestamp: position.open_position_timestamp,
          grayll_transaction_id: position.grayll_transaction_id,        
          algorithm_type: position.algorithm_type,
          
          close_value_GRX:              grxusd,
          close_value_GRZ:              grzusd,

          close_position_value_$:       close_position_value_$,
          close_position_value_GRX:     close_position_value_$/grxusd,
          close_position_ROI_$:         close_position_ROI_$,
          close_position_ROI_percent:   close_position_ROI_percent_GROSS,
          close_position_ROI_percent_NET:   close_position_ROI_percent_NET,
          current_position_ROI_$:       close_position_ROI_$,
          current_position_ROI_percent: close_position_ROI_percent_GROSS,
          close_position_total_$:    close_position_total_$,
          close_position_total_GRX:  close_position_total_GRX,
          close_position_total_GRZ:   close_position_total_$/grzusd,
          close_position_fee_$:      close_position_fee_$,
          close_position_fee_GRX:      close_position_total_GRX*0.003,
          close_performance_fee_$:   close_performance_fee_$,
          close_performance_fee_GRX: close_performance_fee_$/grxusd    
        } 
        closePositionsData.push(positionData)
      } else {
        let close_position_total_$ = position.open_position_value_$ + (gryusd - position.open_value_GRY)*position.open_position_value_$/position.open_value_GRZ
        let close_position_fee_$ = close_position_total_$*0.018
        let close_position_ROI_$ = close_position_total_$  - position.open_position_value_$
        let close_performance_fee_$ = 0
        if (close_position_ROI_$ - close_position_fee_$ > 0) {
          close_performance_fee_$ =  (close_position_ROI_$ - close_position_fee_$ ) * 0.18
        }
  
        let close_position_total_GRX = close_position_total_$/grxusd
        let close_position_value_$ = close_position_total_$ - close_position_fee_$ - close_performance_fee_$
        let close_position_ROI_percent_GROSS = close_position_ROI_$*100/position.open_position_value_$
        let close_position_ROI_percent_NET = (close_position_value_$  - position.open_position_value_$)*100/position.open_position_value_$      
        

        let positionData = {  user_id: this.authService.userInfo.Uid,            
          open_stellar_transaction_id: position.open_stellar_transaction_id,
          open_position_timestamp: position.open_position_timestamp,
          grayll_transaction_id: position.grayll_transaction_id,        
          algorithm_type: position.algorithm_type,
          
          close_value_GRX:              grxusd,
          close_value_GRY:              gryusd,

          close_position_value_$:       close_position_value_$,
          close_position_value_GRX:     close_position_value_$/grxusd,
          close_position_ROI_$:         close_position_ROI_$,
          close_position_ROI_percent:   close_position_ROI_percent_GROSS,
          close_position_ROI_percent_NET:   close_position_ROI_percent_NET,
          current_position_ROI_$:       close_position_ROI_$,
          current_position_ROI_percent: close_position_ROI_percent_GROSS,
          close_position_total_$:    close_position_total_$,
          close_position_total_GRX:  close_position_total_GRX,
          close_position_total_GRY:   close_position_total_$/gryusd,
          close_position_fee_$:      close_position_fee_$,
          close_position_fee_GRX:      close_position_total_GRX*0.003,
          close_performance_fee_$:   close_performance_fee_$,
          close_performance_fee_GRX: close_performance_fee_$/grxusd    
        } 
        closePositionsData.push(positionData)
      }       
    })   

    if (closePositionsData.length > 0) {
      this.algoService.closeAll = true
      this.http.post(environment.grz_api_url + 'api/v1/grz/position/closeAll', {action:"CLOSEALL", data: closePositionsData}).subscribe(
        res => {
          // setInterval(() => {
          //   this.loadingService.hide()
          // }, 4500); 
          
        },
        e => {
          this.loadingService.hide()
        }
      )
    }  

  }

}
