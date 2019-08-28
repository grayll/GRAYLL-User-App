import {Component, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {ErrorService} from './error.service';
import {takeUntil} from 'rxjs/operators';
import {BadRequestModel} from './BadRequestModel';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnDestroy {

  alertErrorText: string;
  private unsubscribe$ = new Subject<void>();

  constructor(private errorService: ErrorService) {
    this.errorService.observeErrors()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((error: BadRequestModel | any) => {
      if (error) {
        this.alertErrorText = error.hasOwnProperty('title') ? (error.title) as BadRequestModel : error;
      } else {
        this.alertErrorText = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
