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
  hashIsCached: any

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
    
    console.log('this.tfaEnable:', this.tfaEnable)
    if (this.authService.isTfaEnable()){
      this.tfaEnable = true
    }
    if (this.authService.hash){
      this.hashIsCached = true
    }
    console.log('this.tfaEnable:', this.tfaEnable)
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
        this.address = accId
        console.log('Fed:', accId)
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

    // this.stellarService.decryptSecretKey(this.password, 
    //   {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
    //   SecKey => {
    //   if (SecKey != 'Decryption failed!'){
    //     if (this.tfaEnable && this.twoFaCode){
    //       this.authService.verifyTfaAuth(this.password, this.twoFaCode, 0).then(res => {           
    //         if (res.data.valid === true ){                 
    //           this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), this.withdrawModel.address, 
    //           amount.toString(), asset, memo).then(ledger => {
    //             if (ledger <= 0){
    //               this.error()
    //             } else {
    //               this.popupService.close()
    //               .then(() => {
    //                 setTimeout(() => {
    //                   this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
    //                 }, 50);
    //               })
    //             }
    //           }).catch( e => {
    //             this.error()
    //             console.log('Send asset error: ', e)
    //           })                        
    //         } else {        
    //           switch (res.data.errCode){
    //             case environment.TOKEN_INVALID:
    //               //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
    //               break;
    //             case environment.INVALID_UNAME_PASSWORD:
    //               //this.errorService.handleError(null, 'Your password is invalid. Please try again!')
    //               break;
    //             default:
    //               //this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
    //               break;
    //           }       
    //         }     
    //         }).catch(err => {
    //           //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
    //         })
    //       } else {
    //         this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), this.withdrawModel.address, 
    //         amount.toString(), asset, memo).then(ledger => {
    //         if (ledger <= 0){
    //           this.error()
    //         } else {
    //           this.popupService.close()
    //           .then(() => {
    //             setTimeout(() => {
    //               this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
    //             }, 50);
    //           })
    //         }
    //       }).catch( e => {
    //         this.error()
    //         console.log('Send asset error: ', e)
    //       })  
    //       }
    //     } else { // decrypt failed due to invalid password
    //       this.error()
    //     } 
    //   })   
  }

  sendAsset(amount, asset, memo){
    this.stellarService.decryptSecretKey(this.password, 
      {Salt: this.authService.userData.SecretKeySalt, EncryptedSecretKey:this.authService.userData.EnSecretKey}, 
      SecKey => {
      if (SecKey != 'Decryption failed!'){
        if (this.tfaEnable && this.twoFaCode){
          this.authService.verifyTfaAuth(this.password, this.twoFaCode, 0).then(res => {           
            if (res.data.valid === true ){                 
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
            } else {        
              switch (res.data.errCode){
                case environment.TOKEN_INVALID:
                  //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
                  break;
                case environment.INVALID_UNAME_PASSWORD:
                  //this.errorService.handleError(null, 'Your password is invalid. Please try again!')
                  break;
                default:
                  //this.errorService.handleError(null, 'Can not enable Multisigature. Please try again later!')
                  break;
              }       
            }     
            }).catch(err => {
              //this.errorService.handleError(null, 'Your one-time password is invalid. Please try again!')
            })
          } else if (!this.tfaEnable) {
            this.stellarService.sendAsset(this.stellarService.SecretBytesToString(SecKey), this.withdrawModel.address, 
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
        } else { // decrypt failed due to invalid password
          this.error()
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
