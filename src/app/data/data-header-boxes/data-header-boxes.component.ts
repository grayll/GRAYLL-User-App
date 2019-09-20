import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-data-header-boxes',
  templateUrl: './data-header-boxes.component.html',
  styleUrls: ['./data-header-boxes.component.css']
})
export class DataHeaderBoxesComponent implements OnInit {

  @ViewChild(NgbCarousel) carouselData;

  public lineChartData: Array<any> = [
    { data: [12, 19, 3, 5, 2, 3], label: 'Balance $' }
  ];

  public lineChartLabels: Array<any> = [
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017'
  ];
  public lineChartOptions: any = {
    responsive: true,
    elements: {
      point: {
        radius: 2
      }
    },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            display: false
          }
        }
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            display: false
          }
        }
      ]
    }
  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'transparent',
      borderColor: '#40278C',
      pointBackgroundColor: '#40278C',
      pointBorderColor: '#40278C',
      pointHoverBackgroundColor: '#40278C',
      pointHoverBorderColor: '#40278C'
    }
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';

  constructor() { }

  ngOnInit() {
  }

  swipeLeft() {
    this.carouselData.next();
  }

  swipeRight() {
    this.carouselData.prev();
  }

}
