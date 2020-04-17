import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateNotifyService {
  private _isNotify: boolean = false;
  get isNotify(){
    return this._isNotify;
  }
  constructor() { }

  show(){
    this._isNotify = true;
  }

  hide(){
    this._isNotify = false;
  }

}
