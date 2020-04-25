
import * as c3 from 'c3';
import {Router} from '@angular/router';
import { ChartDataService } from './data-service';
import { Component, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { TimePrice, PriceData } from './data-model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.css']
})
export class MainChartComponent {

  isFirstLoad:boolean = true
  subs: Subscription[] = [];
  today: String
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  timespanFilter = [
    {
      id: 5,
      frame:"frame_05m",
      name: '5 Minutes'
    },
    {
      id: 15,
      frame:"frame_15m",
      name: '15 Minutes'
    },
    {
      id: 30,
      frame:"frame_30m",
      name: '30 Minutes'
    },
    {
      id: 60,
      frame:"frame_01h",
      name: '1 Hours'
    },
    {
      id: 240,
      frame:"frame_04h",
      name: '4 Hours'
    },
    {
      id: 1440,
      frame:"frame_01d",
      name: '1 Day'
    }
  ];

  selectedTimespan: {id: number, frame:string, name: string} = this.timespanFilter[4];
  public onChange(value: any) {
    console.log(this.selectedTimespan)
    this.getFrameData()
  }
  
  getFrameData(){
    this.dataService.getFramesData(288, "grxusd,gryusd,grzusd", this.selectedTimespan.frame).subscribe(data => {      
      console.log(data)
      if (data.res.grxusd && data.res.grxusd[0]){ 
        
        let timeFrame:TimePrice[] = [] 
        data.res.grxusd.forEach(p => {
          let np = {t: new Date(p.ts*1000), y:p.price}
          timeFrame.unshift(np)
        });
        this.lineChartData[0].data  = timeFrame        
      }   
      
      if (data.res.gryusd && data.res.gryusd[0]){ 
        
        let timeFrame:TimePrice[] = [] 
        data.res.gryusd.forEach(p => {
          let np = {t: new Date(p.ts*1000), y:p.price}   
          timeFrame.unshift(np)
        });
        this.lineChartData[1].data  = timeFrame        
      } 

      if (data.res.grzusd && data.res.grzusd[0]){ 
       
        let timeFrame:TimePrice[] = [] 
        data.res.grzusd.forEach(p => {
          let np = {t: new Date(p.ts*1000), y:p.price}   
          timeFrame.unshift(np)
        });
        this.lineChartData[2].data  = timeFrame        
      }       
    })
  }

  constructor(
    private router: Router,
    private dataService: ChartDataService
  ) {
    this.today = moment(new Date()).format('H:mm | D MMM YYYY')
    // After first load, will register with time frame change
    //Chart.defaults.scale.gridLines.display = false;
    this.getFrameData()    
  }

  ngOnInit() {
    setInterval( () => { 
           this.today = moment(new Date()).format('h:mm | D MMM YYYY')
    }, 60000);
  }

  
  ngAfterViewInit() {
  }

 
// RunSubcribeFrameData(){
//   // Run schedule to get data
//   this.subs.push(this.dataService.runDataFrames(1, "", "").subscribe(data => {
//     // push data to chart
//     var coin = this.dataService.getCoinDocName(this.dataService.coinIndex)
        
//     if (this.chart && data.grzusd && data.grzusd[0]){       
//       var l1 = this.lineChartData[0].data.length   
//       let date = new Date(data.grzusd[0].ts*1000)    
      
//       if (date > this.lineChartData[0].data[l1-1].t){                        
//         if (l1 >= 288) {
//           this.lineChartData[0].data.shift();
//         }      
//         this.lineChartData[0].data.push({t: new Date(data.grzusd[0].ts*1000), y: data.grzusd[0].price});                  
//       }
//     }
//     if (this.chart && data[coin] && data[coin][0] ){     
//       var l2 = this.lineChartData[1].data.length   
//       let date = new Date(data[coin][0].ts*1000)         
//       if (date > this.lineChartData[1].data[l2-1].t){   
//         if (l2 >= 288) {
//           this.lineChartData[1].data.shift();
//         }
//         this.lineChartData[1].data.push({t: new Date(data[coin][0].ts*1000), y: data[coin][0].price});        
//       }     
//     }
//     this.chart.update();
//   }))
// }
ConvertToTimePrice(priceData: PriceData){
  var timePrice = {t: new Date(priceData.ts*1000), y: priceData.price}  
  return timePrice
}
ConvertToMap(timePrice:TimePrice){
  return {t:timePrice.t, y:timePrice.y}
}
//pattern: ['#ff821c', '#40c4ff', '#1240c2'] 
public lineChartData =  [
  {
    label: 'GRX',
    backgroundColor: '#1240c2',
    borderColor: '#1240c2',
    data: [],
    type: 'line',
    pointRadius: 0,
    fill: false,
    lineTension: 0,
    borderWidth: 1.5
  },
  {
    label: 'GRY',
    backgroundColor: '#40c4ff',
    borderColor: '#40c4ff',
    data: [],
    type: 'line',
    pointRadius: 0,
    fill: false,
    lineTension: 0,
    borderWidth: 1.3,
    yAxisID: 'id-right',
  },
  {
    label: 'GRZ',
    backgroundColor: '#ff821c',
    borderColor: '#ff821c',
    data: [],
    type: 'line',
    pointRadius: 0,
    fill: false,
    lineTension: 0,
    borderWidth: 1.3,
    yAxisID: 'id-right1',
  }
];


public lineChartOptions: (ChartOptions & { annotation: any }) = {
  responsive: true,
  //showLines: false,
  maintainAspectRatio: false,
    scales: {
      xAxes: [
      {
        display: false,
        type: 'time',
        time: {
                displayFormats: {
                  second: 'h:mm:ss'
                }
              },
        distribution: 'series',
        ticks: {
          source: 'data',
          autoSkip: true
        },
        gridLines: {
          drawBorder: true,
          //display: false
        }
      }],
      yAxes: [
        {
          id: 'id-left',
          position: 'left',
          ticks: { fontColor: 'white' ,
          callback: label => {            
            let s = `$ ${label}`
            if (label.toString().length <= 2 ){              
              s= `$ ${label}.0`              
            }            
            return s
          }},
          gridLines: { color: 'rgba(255,255,255,0.1)' }                  
        },
        {
          id: 'id-right',
          position: 'right',
          display: false,          
        },
        {
          id: 'id-right1',
          position: 'right',
          display: false,          
        }
      ]
    },
    tooltips: {
      intersect: false,
      mode: 'nearest',
      callbacks: {
        label: function(tooltipItem, myData) {            
          return (+tooltipItem.yLabel.toString()).toFixed(4) + ':' + tooltipItem.xLabel as string;
        }
      }
    },
      annotation : {
    }
  };

  public lineChartLegend = true;
  public lineChartType = 'bar';
  public lineChartColors = [];
  public lineChartPlugins = [pluginAnnotations];  

  ngOnDestroy(){  
    this.subs.forEach(sub => sub.unsubscribe());
  }
  scrollToOpenAlgoPositionForm() {
    const el = document.getElementById('algoPositionForm');
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    } else {
      this.router.navigate(['/system/overview']);
    }
  }

}
