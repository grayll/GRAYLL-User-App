import { Injectable } from '@angular/core';
import {WithdrawModel} from '../wallet/wallet-stats/withdraw/withdraw.model';
import {AlgoPositionModel} from '../system/algo-position.model';
import {UserService} from '../authorization/user.service';
import { AuthService } from './services/auth.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
//var fontref = require('src/app/jspdf/Nunito-Regular-normal.js')

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

  public setLoanPaid() {
    this.authService.userData.LoanPaidStatus = 2;
    this.authService.SetLocalUserData()
  }

  savePDF(columns, fields, data:any, fileName: string) {
    var doc = new jsPDF({orientation: 'landscape'});   
    // fontref;                             // 'run' .js to load font

    // doc.getFontList();                   // contains a key-value pair for CustomFont
    // console.log(doc.getFontList())
    // doc.setFont("Nunito");           // set font
    // doc.setFontType("normal");        
    // doc.setFontSize(7)
    
    var rows = [];
    data.forEach(item => {
      let fieldData = []
      fields.forEach(fieldName => {
        fieldData.push(item[fieldName])
      });
      rows.push(fieldData)
    })

    doc.autoTable(columns, rows);
    doc.save(fileName);
  }

  public getLoanPaid() { 
    // if (!this.authService.userData){
    //   this.authService.GetLocalUserData()
    // }
    if (this.authService.userData && !this.authService.userData.LoanPaidStatus){      
      return false
    } 
    if (this.authService.userData && this.authService.userData.LoanPaidStatus === 2){      
      return true
    }    
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
