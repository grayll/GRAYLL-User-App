import { Component, OnInit } from '@angular/core';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import { SharedService } from '../shared/shared.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.css']
})
export class ReferralComponent implements OnInit {
  activeTabId: string;
  faWarning = faExclamationTriangle;

  constructor(
    private activatedRoute: ActivatedRoute,
    public sharedService: SharedService
  ) {
    this.loadDataFromRoute();
  }

  ngOnInit(): void {
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
