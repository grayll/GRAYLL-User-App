import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {SharedService} from '../shared.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private ngbModalOptions: NgbModalOptions = {
    backdrop : 'static',
    keyboard : false,
    ariaLabelledBy: 'modal-basic-title'
  };

  public isOpen:boolean = false

  validationResult: Subject<boolean>

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private sharedService: SharedService
  ) { }

  public observeValidation(): Observable<boolean> {
    if (!this.validationResult){
      this.validationResult = new Subject<boolean>()
    }
    return this.validationResult.asObservable()
  }

  public pushValidation(res:boolean){
    if (!this.validationResult){
      this.validationResult = new Subject<boolean>()
    }

    this.validationResult.next(res)
  }

  public open(modal) {
    this.isOpen = true
    this.sharedService.hideModalOverview();
    setTimeout(() => {
      this.modalService.open(modal, this.ngbModalOptions).result
      .then(() => {}, () => {});
    }, 0);
  }

  public async close() {
    this.isOpen = false
    setTimeout(() => {
      this.router.navigate([{ outlets: { popup: null } }])
      .then(() => window.history.back());
    }, 0);
    this.modalService.dismissAll();
  }
  
  public async closeAndRedirectTo(absoluteUrl: string) {
    this.isOpen = false
    setTimeout(() => {
      this.router.navigate([absoluteUrl, {outlets: {popup: null } }]);
    }, 0);
    this.modalService.dismissAll();
  }
}
