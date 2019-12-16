import {AfterViewInit, Component} from '@angular/core';
import * as c3 from 'c3';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.css']
})
export class MainChartComponent implements AfterViewInit {
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

  constructor(
    private router: Router
  ) { }
//   data: {
//     x: 'x',
//     columns: [
//         ['x', 30, 50, 100, 230, 300, 310],
//         ['data1', 30, 200, 100, 400, 150, 250],
//         ['data2', 130, 300, 200, 300, 250, 450]
//     ]
// }
  ngAfterViewInit() {
    const chart = c3.generate({
      bindto: '#main-chart-graph',
      data: {
        columns: [
          ['grx', 0.3, 0.5, 0.8, 1, 2, 1, 3, 4, 1],
          ['gry', 0, 35, 30, 60, 20, 80, 50, 180, 150],
          ['grz', 0, 80, 40, 100, 30, 150, 80, 270, 250]
        ],
        type: 'area-spline',
        groups: [['grx', 'gry', 'grz']]
      },
      axis: {
        y: {
          show: true,
          tick: {
            count: 0,
            outer: false,
            ticks : 0.001,
            min:0.01,
            max:10
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


  scrollToOpenAlgoPositionForm() {
    const el = document.getElementById('algoPositionForm');
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    } else {
      this.router.navigate(['/system/overview']);
    }
  }

}
