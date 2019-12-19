
import * as c3 from 'c3';
import {Router} from '@angular/router';
import { ChartDataService } from './data-service';
import { Component, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective} from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { DataModel, TimePrice, PriceData } from './data-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.css']
})
export class MainChartComponent {

  isFirstLoad:boolean = true
  subs: Subscription[] = [];

  dataModels: DataModel[] = [
    {currency: 'GRZ', current: null, color: '#40278C'},
    {currency: 'EUR', current: null, color: '#03F4FC'},
    {currency: 'JPY', current: null, color: '#FFC0CB'},
    {currency: 'GBP', current: null, color: '#900C3F'},
    {currency: 'CHF', current: null, color: '#FFA700'},
  ];
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  timespanFilter = [
    {
      id: 1,
      name: '5 Minutes'
    },
    {
      id: 2,
      name: '15 Minutes'
    },
    {
      id: 3,
      name: '30 Minutes'
    },
    {
      id: 4,
      name: '1 Hours'
    },
    {
      id: 5,
      name: '4 Hours'
    },
    {
      id: 6,
      name: '1 Day'
    }
  ];

  selectedTimespan: {id: number, name: string} = this.timespanFilter[2];

  ngAfterViewInit() {
  }

  constructor(
    private router: Router,
    private dataService: ChartDataService
  ) {
    this.subs.forEach(sub => sub.unsubscribe());
    // After first load, will register with time frame change and coin index change
    this.subs.push(this.dataService.timeFrameChanged$.subscribe(frameIndex => {
      this.dataService.frameIndex = frameIndex
              
      let frame =  this.dataService.getFrameName(this.dataService.frameIndex)    
      let coin = this.dataService.getCoinDocName(this.dataService.coinIndex)
      
      this.subs.push(this.dataService.getFramesData(288, "grzusd", frame).subscribe(data => {      
        
        if (data.grzusd && data.grzusd[0]){ 
          let grayPrices:TimePrice[] = [] 
          data.grzusd.forEach(p => {
            let np = {t: new Date(p.ts*1000), y:p.price}   
            grayPrices.push(np)
          });
          this.lineChartData[0].data  = grayPrices        
        }   
        
      }))
      this.subs.push(this.dataService.getFramesData(288, coin, frame).subscribe(data => {      
        
        if (data[coin] && data[coin][0]){
          let coinPrices:TimePrice[] = []
          
            data[coin].forEach(p => {
            let np = {t: new Date(p.ts*1000), y:p.price}   
            coinPrices.push(np)
          });
          this.lineChartData[1].data  = coinPrices
          this.lineChartData[1].backgroundColor = this.dataModels[this.dataService.coinIndex].color;
          this.lineChartData[1].borderColor = this.dataModels[this.dataService.coinIndex].color;
          this.lineChartData[1].label = this.dataModels[this.dataService.coinIndex].currency;
              
        }    
      }))  
      this.isFirstLoad = false
      //this.RunSubcribeFrameData()    
    }));
    this.subs.push(this.dataService.coinChanged$.subscribe(index => { 
      this.dataService.coinIndex = index 
      if (!this.isFirstLoad) {
        //this.subs.forEach(sub => sub.unsubscribe()) 
        let coin = this.dataService.getCoinDocName(this.dataService.coinIndex)
        let frame =  this.dataService.getFrameName(this.dataService.frameIndex)            
        
        this.dataService.getFramesData(288, coin, frame).subscribe(data => {      
          //console.log('TRADECHART - getFramesData- coin, frame:', coin, frame)  
          if (data[coin] && data[coin][0]){
            let coinPrices:TimePrice[] = []
            
              data[coin].forEach(p => {
              let np = {t: new Date(p.ts*1000), y:p.price}   
              coinPrices.push(np)
            });
            this.lineChartData[1].data  = coinPrices
            this.lineChartData[1].backgroundColor = this.dataModels[this.dataService.coinIndex].color;
            this.lineChartData[1].borderColor = this.dataModels[this.dataService.coinIndex].color;
            this.lineChartData[1].label = this.dataModels[this.dataService.coinIndex].currency;
                  
          }    
        })         
      }
    })); 

    this.lineChartData[1].backgroundColor = this.dataModels[this.dataService.coinIndex].color;
    this.lineChartData[1].borderColor = this.dataModels[this.dataService.coinIndex].color;
    this.lineChartData[1].label = this.dataModels[this.dataService.coinIndex].currency;
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

public lineChartData =  [
  {
    label: 'GRZ',
    backgroundColor: '#43278C',
    borderColor: '#43278C',
    data: [],
    type: 'line',
    pointRadius: 0,
    fill: false,
    lineTension: 0,
    borderWidth: 2
  },
  {
    label: 'BTC',
    backgroundColor: '#03F4FC',
    borderColor: '#03F4FC',
    data: [],
    type: 'line',
    pointRadius: 0,
    fill: false,
    lineTension: 0,
    borderWidth: 2,
    yAxisID: 'id-right',
  }
];


public lineChartOptions: (ChartOptions & { annotation: any }) = {
  responsive: true,
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
        }
      }],
      yAxes: [
        {
          id: 'id-left',
          position: 'left',
        },
        {
          id: 'id-right',
          position: 'right',
          display: false
        }
      ]
    },
    tooltips: {
      intersect: false,
      mode: 'nearest',
      callbacks: {
        label: function(tooltipItem, myData) {            
          return tooltipItem.yLabel + ':' + tooltipItem.xLabel as string;
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

//   data: {
//     x: 'x',
//     columns: [
//         ['x', 30, 50, 100, 230, 300, 310],
//         ['data1', 30, 200, 100, 400, 150, 250],
//         ['data2', 130, 300, 200, 300, 250, 450]
//     ]
// }
  // ngAfterViewInit() {
  //   const chart = c3.generate({
  //     bindto: '#main-chart-graph',
  //     data: {
  //       xs: {
  //         'grx'
  //       },
  //       columns: [
  //         ['grx', 0.01, 0.014, 0.016, 0.023, 0.033, 0.045, 0.06, 0.5, 1],
  //         ['gry', 0.01, 0.02, 0.03, 0.04, 0.02, 0.056, 0.1, 0.8, 1.2],
  //         ['grz', 0.01, 0.011, 0.015, 0.017, 0.02, 0.03, 0.04, 0.021, 0.05]
  //       ],
  //       axes: {
  //         grx: 'y',
  //         gry: 'y1',
  //         grz: 'y2'
  //       },
  //       type: 'area-spline',
  //       // groups: [['grx', 'gry', 'grz']]
  //     },
  //     axis: {
  //       y: {
  //         show: true,
  //         tick: {
  //           count: 0,
  //           outer: false
  //         }
  //       },
  //       y1: {
  //         show: false,
  //         tick: {
  //           count: 0,
  //           outer: false
  //         }
  //       },
  //       y2: {
  //         show: false,
  //         tick: {
  //           count: 0,
  //           outer: false
  //         }
  //       },
  //       x: {
  //         show: false
  //       }
  //     },
  //     padding: {
  //       top: 20,
  //       right: 10,
  //       bottom: 0,
  //       left: 30
  //     },
  //     point: {
  //       r: 2
  //     },
  //     legend: {
  //       hide: true
  //     },
  //     color: {
  //       pattern: ['#ff821c', '#40c4ff', '#1240c2']
  //     }
  //   });
  // }


  // scrollToOpenAlgoPositionForm() {
  //   const el = document.getElementById('algoPositionForm');
  //   if (el) {
  //     el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  //   } else {
  //     this.router.navigate(['/system/overview']);
  //   }
  // }

}
