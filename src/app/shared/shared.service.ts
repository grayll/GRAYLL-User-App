import { Injectable } from '@angular/core';
import {WithdrawModel} from '../wallet/wallet-stats/withdraw/withdraw.model';
import {AlgoPositionModel} from '../system/algo-position.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  modalOverlay = false;
  private withdrawModel: WithdrawModel;
  private algoPosition: AlgoPositionModel;

  constructor() {}

  public showModalOverview() {
    this.modalOverlay = true;
  }

  public hideModalOverview() {
    this.modalOverlay = false;
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
