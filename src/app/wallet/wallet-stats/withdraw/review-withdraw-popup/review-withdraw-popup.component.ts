import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../../../shared/popup/popup.service';
import {SharedService} from '../../../../shared/shared.service';
import {Router} from '@angular/router';
import {SubSink} from 'subsink';
import {WithdrawModel} from '../withdraw.model';
import { StellarService } from 'src/app/authorization/services/stellar-service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment'
import {ErrorService} from '../../../../shared/error/error.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-review-withdraw-popup',
  templateUrl: './review-withdraw-popup.component.html',
  styleUrls: ['./review-withdraw-popup.component.css']
})
export class ReviewWithdrawPopupComponent implements OnInit, OnDestroy {

  password: string
  multiSigEnable: boolean
  //twoFaEnable: boolean
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
    private authService: AuthService,
    private errorService: ErrorService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit() {
    if (!this.authService.userData.withdraw){
      //this.popupService.close()
      this.router.navigateByUrl("/wallet/overview")
    }
    this.popupService.open(this.modal);
    this.withdrawModel = this.sharedService.getWithdrawModel();    
    this.multiSigEnable = this.authService.userInfo.Setting.MulSignature
    //this.twoFaEnable = this.authService.userInfo.Tfa
  }

  
  back() {
    //this.sharedService.showModalOverview();
    this.popupService.close()
    .then(() => {
      setTimeout(() => {
        this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw'}}]);
      }, 50);
    })
    .catch((error) => console.log(error));
  }

  next() {
    //this.sharedService.showModalOverview();
    let amount = 0
    let asset
    
    if (this.withdrawModel.asset === 'GRX') {
      amount = this.withdrawModel.amount  
      asset = this.stellarService.grxAsset     
    } else if(this.withdrawModel.asset === 'XLM'){
      amount = this.withdrawModel.amount  
      asset = this.stellarService.nativeAsset
    } else {
      
      return
    }
    
    let memo = ''
    if (this.withdrawModel.memoMessage && this.withdrawModel.memoMessage.length > 0){
      memo = this.withdrawModel.memoMessage
    }   
    this.authService.userData.withdraw = false
    this.address = this.withdrawModel.address
    this.sendAsset(amount, asset, memo)
    
    // if (this.withdrawModel.address.includes('*')){
    //   this.stellarService.getAccountFromFed(this.withdrawModel.address).then(accId => {
    //     this.withdrawModel.address = accId.toString() 
         
    //     this.sendAsset(amount, asset, memo)
    //     this.authService.userData.withdraw = false
        
    //   }).catch( err => {
    //     console.log(err)
    //     this.error()
    //   })       
    // } else {
    //   this.sendAsset(amount, asset, memo)
    //   this.authService.userData.withdraw = false
    // }      
  }

  async sendAsset1(amount, asset, memo){ 
    //this.authService.GetSecretKey(this.password).then(async SecKey => {        
      if (this.multiSigEnable && this.twoFaCode){
        this.authService.verifyTfaAuth(this.password, this.twoFaCode, 0)
        .subscribe(async res => {           
          if ((res as any).valid === true ){  
            try {
              let xdr = await this.stellarService.getWithdrawXdr(this.authService.userInfo.PublicKey, this.withdrawModel.address, 
                amount.toString(), asset, memo)
              
              if (xdr === 'not trusted'){
                this.errorService.handleError(null, '2FA code is invalid! Please retry.')
                return
              }
               
              this.authService.makeTransaction(xdr, "withdraw").subscribe(res => {
               
                if ((res as any).errCode == "tx_success"){
                  this.popupService.close()
                  .then(() => {
                    if (asset.code === 'XLM'){
                      this.authService.userMetaStore.XLM = this.authService.userMetaStore.XLM - amount
                    } else {
                      this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX - amount
                    }
                    setTimeout(() => {
                      this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
                    }, 50);
                  })
                }
              })          
            } catch (e){
              console.log(e)
              this.error()
            }                        
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
      } else if (!this.multiSigEnable) {
        // console.log('sendAsset:', SecKey,
        //  this.withdrawModel.address, amount.toString(), asset)
       
        try {
          let xdr = await this.stellarService.getWithdrawXdr(this.authService.userInfo.PublicKey, this.withdrawModel.address, 
            amount.toString(), asset, memo)
          
          this.authService.makeTransaction(xdr, "withdraw").subscribe(res => {
            
            if ((res as any).errCode == "tx_success"){
              this.popupService.close()
              .then(() => {
                if (asset.code === 'XLM'){
                  this.authService.userMetaStore.XLM = this.authService.userMetaStore.XLM - amount
                } else {
                  this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX - amount
                }
                setTimeout(() => {
                  this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
                }, 50);
              })
            }
          })          
        } catch (e){
          console.log(e)
          this.error()
        }
        // this.stellarService.sendAsset(SecKey, this.withdrawModel.address, 
        //   amount.toString(), asset, memo)
        // .then(ledger => {
        //   if (ledger <= 0){
        //     this.error()
        //   } else {
        //     this.popupService.close()
        //     .then(() => {
        //       setTimeout(() => {
        //         this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
        //       }, 50);
        //     })
        //   }
        // }).catch( e => {
        //   this.error()
        //   console.log('Send asset error: ', e)
        // }) 
      } 
        
}

  sendAsset(amount, asset, memo){ 
    this.loadingService.show()   
    let SecKey =  this.authService.getSecretKey()
    if (this.multiSigEnable && this.twoFaCode){
      
      this.authService.verifyTfaAuth(this.password, this.twoFaCode, 0)
      .subscribe(res => {           
        if ((res as any).valid === true ){                 
          this.stellarService.sendAsset(SecKey, this.withdrawModel.address, 
          amount.toString(), asset, memo).then(ledger => {
            this.loadingService.hide()
            this.popupService.close()
            .then(() => {              
              if (asset.code === 'XLM'){
                //console.log('asset.code', asset.code)
                this.authService.userMetaStore.XLM = +this.authService.userMetaStore.XLM - +amount
              } else {
                //console.log('asset.code1', asset.code)
                this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX - +amount
              }
              
              setTimeout(() => {
                this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
              }, 50);
            })
          }).catch( e => {
            this.error()
            console.log('Send asset error: ', e)
            this.loadingService.hide()
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
          this.loadingService.hide()    
        }     
      },
      err => {
        //this.errorService.handleError(null, '2FA code is invalid! Please retry.')
      })
    } else {
      //  console.log('sendAsset:', SecKey,
      //   this.withdrawModel.address, amount.toString(), asset)
      this.loadingService.show()
      this.stellarService.sendAsset(SecKey, this.withdrawModel.address, amount.toString(), asset, memo)
      .then(ledger => {
        this.loadingService.hide()
        this.popupService.close()        
        .then(() => {
          
          if (asset.code === 'XLM'){            
            this.authService.userMetaStore.XLM = +this.authService.userMetaStore.XLM - +amount
          } else {            
            this.authService.userMetaStore.GRX = +this.authService.userMetaStore.GRX - +amount
          }
          setTimeout(() => {
            this.router.navigate(['/wallet/overview', {outlets: {popup: 'withdraw-success'}}]);
          }, 50);
        })
      }).catch( e => {
        this.error()
        console.log('Send asset error: ', e)
      }) 
    }        
  }

  error() {
    //this.sharedService.showModalOverview();
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
