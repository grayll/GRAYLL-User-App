import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {

  activeTabId: string;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    this.loadDataFromRoute();
  }

  ngOnInit() {
    window.scroll(0, 0);
  }

  private loadDataFromRoute() {
    const data = this.activatedRoute.snapshot.data;
    if (data.scroll) {
      this.activeTabId = 'allAlgoPositions';
      setTimeout(() => {
        const el = document.getElementById('systemActivityTable');
        el.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
      }, 500);
    }
  }

}
