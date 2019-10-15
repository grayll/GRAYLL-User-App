import { Injectable } from '@angular/core';
import {WithdrawModel} from '../wallet/wallet-stats/withdraw/withdraw.model';
import {AlgoPositionModel} from '../system/algo-position.model';
import {UserService} from '../authorization/user.service';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  modalOverlay = false;
  private withdrawModel: WithdrawModel;
  private algoPosition: AlgoPositionModel;
  private isLoanPaid: boolean;
  

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  public showModalOverview() {
    this.modalOverlay = true;
  }

  public hideModalOverview() {
    this.modalOverlay = false;
  }

  public setIsLoan(value: boolean) {
    this.authService.userData.IsLoan = value;
  }

  public getIsLoanPaid() {    
    if (this.authService.userData.IsLoan != null && this.authService.userData.IsLoan === false){  
      //console.log('this.authService.userData.IsLoan 1:', this.authService.userData.IsLoan)    
      return true
    }
    //console.log('this.authService.userData.IsLoan:2', this.authService.userData.IsLoan)
    return false;
  }

  // Wallet page - Withdraw popup
  public setWithdrawModel(model: WithdrawModel) {
    this.withdrawModel = model;
  }

  public getWithdrawModel(): WithdrawModel {
    return this.withdrawModel;
  }

  // System page - Open Algo Position
  public openAlgoPosition(algo: AlgoPositionModel) {
    this.algoPosition = algo;
  }

  public getOpenedAlgoPosition(): AlgoPositionModel {
    return this.algoPosition;
  }
}
