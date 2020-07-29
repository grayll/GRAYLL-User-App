import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {PopupService} from '../../../shared/popup/popup.service';
import {SharedService} from '../../../shared/shared.service';
import {AlgoPositionModel} from '../../algo-position.model';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AlgoService } from '../../algo.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-open-algo-position-error',
  templateUrl: './open-algo-position-error.component.html',
  styleUrls: ['./open-algo-position-error.component.scss']
})
export class OpenAlgoPositionErrorComponent implements OnInit {

  @ViewChild('content') modal;
  algoPosition: AlgoPositionModel;

  retryCount = 0

  constructor(
    public popupService: PopupService,
    private sharedService: SharedService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private algoService: AlgoService,
    private router: Router,
    private ngzone: NgZone,
  ) { }

  ngOnInit() {
    this.popupService.open(this.modal);
    this.algoPosition = this.sharedService.getOpenedAlgoPosition();
    if (!this.algoPosition){
      this.popupService.close()
    }
  }

  retry(){
    this.retryCount++
    if (!this.algoService.currentOpenPosition || this.retryCount > 3){
      console.log('retry three times')
      this.retryCount = 0
      this.popupService.close()
    }
    
    this.loadingService.show()
    this.http.post(this.algoService.currentURL, this.algoService.currentOpenPosition).subscribe(res => {             
      let errCode = (res as any).errCode
      this.loadingService.hide()
      if (errCode != environment.SUCCESS ){     
        // save data to retry  
        if (errCode != environment.TX_IN_USED || errCode != environment.INTERNAL_ERROR_RETRY){
          this.algoService.currentOpenPosition = null
        }
        //this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
      } else {       
       this.algoPosition.grayllTxId = (res as any).grayllTxId
       this.algoPosition.stellarTxId = (res as any).stellarTxId       
       this.sharedService.openAlgoPosition(this.algoPosition);
       this.algoService.currentOpenPosition = null
       this.popupService.close().then(() => {
        setTimeout(() => {
          this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-success'}}]);
        }, 20);
      })
      
       //this.algoService.retrySuccess.next(true)
      }      
  },
  e => {
    console.log('ex:', e)
    //this.router.navigate(['/system/overview', {outlets: {popup: 'open-algo-position-error'}}]);
    this.loadingService.hide()
  })
  }

}
