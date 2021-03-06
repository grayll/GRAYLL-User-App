import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';
import {SharedService} from '../shared/shared.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit, OnDestroy {

  activeTabId: string;
  faWarning = faExclamationTriangle;
  pageId: string

  constructor(
    private activatedRoute: ActivatedRoute,
    public sharedService: SharedService,
    public authService: AuthService,
  ) {
    this.pageId = "system"
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
