import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SharedService} from '../../../../shared/shared.service';
import {Router} from '@angular/router';
import {SubSink} from 'subsink';
import {WithdrawModel} from '../withdraw.model';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-review-withdraw-popup',
  templateUrl: './review-withdraw-popup.component.html',
  styleUrls: ['./review-withdraw-popup.component.css']
})
export class ReviewWithdrawPopupComponent implements OnInit, OnDestroy {

  password: string
  tfaEnable: boolean
  twoFaCode: string

  @ViewChild('content') modal;
  private subscriptions = new SubSink();
  private withdrawModel: WithdrawModel;

  constructor(
    private popupService: PopupService,
    private sharedService: SharedService,
    private router: Router,
    private stellarService: StellarService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.popupService.open(this.modal);
    this.withdrawModel = this.sharedService.getWithdrawModel();
    // if (!(this.withdrawModel.grxAmount && this.withdrawModel.grxAmount > 0) || 
    // !(this.withdrawModel.xlmAmount && this.withdrawModel.xlmAmount > 0)){
    //   this.router.navigateByUrl('/wallet/overview');
    //   return
    // }
    if (this.authService.userData.Tfa.Enable && this.authService.userData.Tfa.Enable){
      this.tfaEnable = true
    }
  }

  back() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }

  next() {
    this.sharedService.showModalOverview();
    let amount = 0
    let asset
    if (this.withdrawModel.grxAmount && this.withdrawModel.grxAmount > 0) {
      amount = this.withdrawModel.grxAmount  
      asset = this.stellarService.grxAsset     
    } else if(this.withdrawModel.xlmAmount && this.withdrawModel.xlmAmount > 0){
      amount = this.withdrawModel.xlmAmount  
      asset = this.stellarService.nativeAsset
    } else {
      return
    }
    let memo = ''
    if (this.withdrawModel.memoMessage && this.withdrawModel.memoMessage.length > 0){
      memo = this.withdrawModel.memoMessage
    }       

    this.stellarService.decryptSecretKey(this.password, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
    SecKey => {
      if (SecKey != 'Decryption failed!'){        
        this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), this.withdrawModel.address, 
          amount.toString(), asset, memo).then(ledger => {
            if (ledger <= 0){
              this.error()
            } else {
              this.popupService.close()
              .then(() => {
                setTimeout(() => {
                  this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
                }, 50);
              })
            }
          }).catch( e => {
            this.error()
            console.log('Send asset error: ', e)
          })
      }
    })   
  }

  error() {
    this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-error'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
