import {AfterViewInit, Component} from '@angular/core';
import * as c3 from 'c3';

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.css']
})
export class MainChartComponent implements AfterViewInit {
  timespanFilter = [
    {
      id: 1,
      name: 'Monthly'
    },
    {
      id: 2,
      name: 'Daily'
    },
    {
      id: 3,
      name: 'Weekly'
    },
    {
      id: 4,
      name: 'Yearly'
    }
  ];

  selectedTimespan: {id: number, name: string} = this.timespanFilter[0];

  constructor() { }

  ngAfterViewInit() {
    const chart = c3.generate({
      bindto: '#main-chart-graph',
      data: {
        columns: [
          ['Ripple', 0, 15, 15, 38, 8, 40, 20, 100, 70],
          ['Ethereum', 0, 35, 30, 60, 20, 80, 50, 180, 150],
          ['Bitcoin', 0, 80, 40, 100, 30, 150, 80, 270, 250]
        ],
        type: 'area-spline',
        groups: [['Ripple', 'Ethereum', 'Bitcoin']]
      },
      axis: {
        y: {
          show: true,
          tick: {
            count: 0,
            outer: false
          }
        },
        x: {
          show: false
        }
      },
      padding: {
        top: 20,
        right: 10,
        bottom: 0,
        left: 30
      },
      point: {
        r: 2
      },
      legend: {
        hide: true
      },
      color: {
        pattern: ['#ff821c', '#40c4ff', '#1240c2']
      }
    });
  }

}
