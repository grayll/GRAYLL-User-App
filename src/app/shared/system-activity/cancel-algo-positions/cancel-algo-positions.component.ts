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
      // let params = param.name;
      // let index = params.indexOf("GR");
      // this.algoName = params.substring(index, params.length);
      this.algoName = param.name;
    })
    this.subs = this.authService.subCloseAllEnd().subscribe( end => {
      this.algoService.closingAllAlgo = ''
      this.closePopup()
    })
    this.algoService.closingAllAlgo = ''
  }
  
  closeAll(){
    if (!this.algoService.closeAllPositions){
      this.popupService.close()
      return
    }
    this.loadingService.show()
    // let grzusd = this.authService.priceInfo.grzusd
    // let grxusd = this.authService.priceInfo.grxusd
    // let gryusd = this.authService.priceInfo.gryusd

    // let closePositionsData = []
    // let closePositionsDataGry1 = []
    // let closePositionsDataGry2 = []
    // let closePositionsDataGry3 = []
    
    // this.algoService.openPositions.forEach( position => {          
    //     switch(position.algorithm_type){
    //       case "GRZ":
    //         closePositionsData.push(position.grayll_transaction_id)
    //         break
    //       case "GRY 1":            
    //         closePositionsDataGry1.push(position.grayll_transaction_id)
    //         break
    //       case "GRY 2":           
    //         closePositionsDataGry2.push(position.grayll_transaction_id)
    //         break
    //       case "GRY 3":           
    //         closePositionsDataGry3.push(position.grayll_transaction_id)
    //         break
    //     }
    // }) 
    let url = ''
              
    switch (this.algoName) {
      case 'GRZ':
        url = environment.grz_api_url + 'api/v1/grz/position/closeAll'       
        break
      case 'GRY 1':
        url = environment.gry1_api_url + 'api/v1/gry/position/closeAll'       
        break
      case 'GRY 2':
        url = environment.gry2_api_url + 'api/v1/gry/position/closeAll'        
        break
      case 'GRY 3':
        url = environment.gry3_api_url + 'api/v1/gry/position/closeAll'       
        break
    }
    if (this.algoService.closeAllPositions && this.algoService.closeAllPositions.positions.length > 0){
      this.algoService.closingAllAlgo = this.algoName
      //console.log('closeall:', this.algoService.closeAllPositions)
      this.http.post(url, this.algoService.closeAllPositions).subscribe(
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
  }
  closePopup(){
    this.algoService.closeAllPositions = null
    this.loadingService.hide()
    this.popupService.close()
    if (this.subs){
      this.subs.unsubscribe()
    }
  }

}
