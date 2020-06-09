import { Injectable } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
//var fontref = require('src/app/jspdf/Nunito-Regular-normal.js')
// import * as fontref from 'src/app/jspdf/Nunito-Regular-normal'
@Injectable({
  providedIn: 'root'
})
export class PdfDownloadService {
  modalOverlay = false;
  private isLoanPaid: boolean;

  constructor(
  ) { }

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
  
}
