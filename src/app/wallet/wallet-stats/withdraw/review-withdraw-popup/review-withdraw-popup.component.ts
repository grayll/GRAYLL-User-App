import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SharedService} from '../../../../shared/shared.service';
import {Router} from '@angular/router';
import {SubSink} from 'subsink';
import {WithdrawModel} from '../withdraw.model';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-review-withdraw-popup',
  templateUrl: './review-withdraw-popup.component.html',
  styleUrls: ['./review-withdraw-popup.component.css']
})
export class ReviewWithdrawPopupComponent implements OnInit, OnDestroy {

  password: string
  tfaEnable: boolean
  twoFaCode: string
  address: any
  //hashIsCached: any

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
    if (!this.authService.userData.withdraw){
      //this.popupService.close()
      this.router.navigateByUrl("/wallet/overview")
    }
    this.popupService.open(this.modal);
    this.withdrawModel = this.sharedService.getWithdrawModel();
    
    this.tfaEnable = this.authService.userInfo.Tfa
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
    this.address = this.withdrawModel.address
    if (this.withdrawModel.address.includes('*')){
      this.stellarService.getAccountFromFed(this.withdrawModel.address).then(accId => {
        this.withdrawModel.address = accId.toString()        
        this.sendAsset(amount, asset, memo)
        this.authService.userData.withdraw = false
      }).catch( err => {
        console.log(err)
        this.error()
      })       
    } else {
      this.sendAsset(amount, asset, memo)
      this.authService.userData.withdraw = false
    }      
  }

  sendAsset(amount, asset, memo){ 
      this.authService.GetSecretKey(this.password).then(SecKey => {        
        if (this.tfaEnable && this.twoFaCode){
          this.authService.verifyTfaAuth(this.password, this.twoFaCode, 0)
          .subscribe(res => {           
            if ((res as any).valid === true ){                 
              this.stellarService.sendAsset(SecKey, this.withdrawModel.address, 
              amount.toString(), asset, memo).then(ledger => {
                if (ledger <= 0){
                  this.error()
                } else {
                  this.popupService.close()
                  .then(() => {
                    if (asset.code === 'XLM'){
                      this.authService.userData.totalXLM = +this.authService.userData.totalXLM - amount
                    } else {
                      this.authService.userData.totalGRX = +this.authService.userData.totalGRX - amount
                    }
                    setTimeout(() => {
                      this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
                    }, 50);
                  })
                }
              }).catch( e => {
                this.error()
                console.log('Send asset error: ', e)
              })                        
            } else {        
              switch ((res as any).errCode){
                case environment.TOKEN_INVALID:
                    this.error()
                  //this.errorService.handleError(null, '2FA code is invalid! Please retry.')
                  break;
                case environment.INVALID_UNAME_PASSWORD:
                    this.error()
                  //this.errorService.handleError(null, 'Invalid username or password!')
                  break;
                default:
                    this.error()
                  //this.errorService.handleError(null, 'Multisignature could not be enabled! Please retry.')
                  break;
              }       
            }     
          },
          err => {
            //this.errorService.handleError(null, '2FA code is invalid! Please retry.')
          })
        } else if (!this.tfaEnable) {
          console.log('sendAsset:', SecKey,
          this.withdrawModel.address, amount.toString(), asset)
          this.stellarService.sendAsset(SecKey, this.withdrawModel.address, 
            amount.toString(), asset, memo)
          .then(ledger => {
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
    }).catch( err => {
      this.error()
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
