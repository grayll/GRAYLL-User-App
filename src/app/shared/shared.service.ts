import { Injectable } from '@angular/core';
import {WithdrawModel} from '../wallet/wallet-stats/withdraw/withdraw.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  modalOverlay = false;
  private withdrawModel: WithdrawModel;

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
}