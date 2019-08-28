import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  modalOverlay = false;

  constructor() {}

  public showModalOverview() {
    this.modalOverlay = true;
  }

  public hideModalOverview() {
    this.modalOverlay = false;
  }
}
