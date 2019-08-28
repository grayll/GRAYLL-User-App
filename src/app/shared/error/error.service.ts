import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {BadRequestModel} from './BadRequestModel';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorObserver: Subject<BadRequestModel | any>;
  constructor() { }

  public observeErrors(): Observable<BadRequestModel | any> {
    if (!this.errorObserver) {
      this.errorObserver = new Subject();
    }
    return this.errorObserver.asObservable();
  }

  public clearError() {
    if (this.errorObserver) {
      this.errorObserver.next(null);
    }
  }

  public handleError(err: any, frontendErr?: string) {
    if (frontendErr && this.errorObserver) {
      this.errorObserver.next(frontendErr);
    }
    if (!err) {
      return ;
    }
    if (err instanceof HttpErrorResponse) {
      switch (err.status) {
        case 400:
          const badRequest: BadRequestModel = (err.error) as BadRequestModel;
          if (this.errorObserver) {
            this.errorObserver.next(badRequest);
          }
          break;
        case 404:
          break;
        case 500:
          break;
      }
    }
  }
  
  public isEmailAddressValid(emailAddress: string) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(emailAddress).toLowerCase());
  }
}
