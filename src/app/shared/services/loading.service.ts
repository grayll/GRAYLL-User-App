import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loading: boolean = false;
  get loading(){
    return this._loading;
  }
  constructor() { }

  show(){
    this._loading = true;
  }

  hide(){
    this._loading = false;
  }

}
