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
        headStyles: {
          cellWidth: 'wrap',
          fillColor: [64, 39, 140],
          fontSize: 6,
          fontStyle: 'normal'
        }       
      }
    );
    doc.save(fileName);
  }

  saveAlgoPDF(columns, fields, data: any, fileName: string) {
    var doc = new jsPDF({ orientation: 'landscape' });
    var rows = [];
    
    data.forEach(item => {
      let fieldData = []      
      fields.forEach(fieldName => {
        
        switch (fieldName){
          case 'open_value_GRZ':
            if (item[fieldName]){
              fieldData.push(item[fieldName].toFixed(5))
            } else {
              fieldData.push(item['open_value_GRY'].toFixed(5))
            }            
            break
          case 'close_position_value_$':
            if (item['status'] == 'OPEN'){
              fieldData.push(item['current_position_value_$'].toFixed(5))
            } else {
              fieldData.push(item[fieldName].toFixed(5))
            }              
            break
          case 'close_position_ROI_$':
            if (item['status'] == 'OPEN'){
              fieldData.push(item['current_position_ROI_$'].toFixed(5))
            } else {
              fieldData.push(item[fieldName].toFixed(5))
            }
            break
          case 'close_position_ROI_percent':
            if (item['status'] == 'OPEN'){
              fieldData.push(item['current_position_ROI_percent'].toFixed(5))
            } else {
              fieldData.push(item[fieldName].toFixed(5))
            }
            break
          case 'close_stellar_transaction_id':
            if (item['status'] == 'OPEN'){
              fieldData.push(item['open_stellar_transaction_id'])
            } else {
              fieldData.push(item[fieldName])
            }
            break            
            default:
            if (fieldName == 'open_value_GRX' || fieldName == 'current_position_value_$' || fieldName == 'current_position_ROI_$' || fieldName == 'current_position_ROI_percent'){
              fieldData.push(item[fieldName].toFixed(5))
            } else {
              fieldData.push(item[fieldName])
            }
            break
        }        
      });
      rows.push(fieldData)
    });
    console.log(rows)
    doc.autoTable(
      columns,
      rows,
      {
        styles: {
          fontSize: 6
        },
        headStyles: {
          cellWidth: 'wrap',
          fillColor: [64, 39, 140],
          fontSize: 6,
          fontStyle: 'normal'
        }       
      }
    );
    doc.save(fileName);
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
