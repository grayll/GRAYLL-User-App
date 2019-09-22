import {Component, OnDestroy, OnInit} from '@angular/core';
import {faChartLine, faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit, OnDestroy {

  // Font Awesome Icons
  faWarning = faExclamationTriangle;

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit() {
    window.scroll(0, 0);
    this.changeBackgroundColor(true);
  }

  ngOnDestroy(): void {
    this.changeBackgroundColor(false);
  }

  private changeBackgroundColor(addClass: boolean) {
    const body = document.getElementsByTagName('body')[0];
    addClass ? body.classList.add('dark-navy-background') : body.classList.remove('dark-navy-background');
  }

}
