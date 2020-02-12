import { Injectable } from '@angular/core';
import {WithdrawModel} from '../wallet/wallet-stats/withdraw/withdraw.model';
import {AlgoPositionModel} from '../system/algo-position.model';
import {UserService} from '../authorization/user.service';
import { AuthService } from './services/auth.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
//var fontref = require('src/app/jspdf/Nunito-Regular-normal.js')
import * as fontref from 'src/app/jspdf/Nunito-Regular-normal'
@Injectable({
  providedIn: 'root'
})
export class SharedService {
  modalOverlay = false;
  private withdrawModel: WithdrawModel;
  private algoPosition: AlgoPositionModel;
   
  constructor(
    
  ) {}

  public showModalOverview() {
    this.modalOverlay = true;
  }

  public hideModalOverview() {
    this.modalOverlay = false;
  }
    
  savePDF(columns, fields, data: any, fileName: string) {
    var doc = new jsPDF({ orientation: 'landscape' });
    var rows = [];
    data.forEach(item => {
      let fieldData = []
      fields.forEach(fieldName => {
        fieldData.push(item[fieldName])
      });
      rows.push(fieldData)
    });


    doc.autoTable(
      columns,
      rows,
      {
        styles: {
          fontSize: 6
        },
        headerStyles: {
          cellWidth: 'wrap',
          fillColor: [64, 39, 140],
          fontSize: 6,
          fontStyle: 'normal'
        }       
      }
    );
    doc.save(fileName);
  }

  savePDF2(columns, fields, data:any, fileName: string) {
    var doc = new jsPDF({orientation: 'landscape'});    
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
  

  // public getLoanPaid() { 
  //   // if (!this.authService.userData){
  //   //   this.authService.GetLocalUserData()
  //   // }
  //   if (this.authService.userData && !this.authService.userData.LoanPaidStatus){      
  //     return false
  //   } 
  //   if (this.authService.userData && this.authService.userData.LoanPaidStatus === 2){      
  //     return true
  //   }    
  //   return false;
  // }

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
