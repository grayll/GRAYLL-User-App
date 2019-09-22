import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserModel} from '../models/user.model';
import {SharedService} from '../shared/shared.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly userSubject = new BehaviorSubject<UserModel>(
    new UserModel(
      1,
      true,
      false,
      false,
      2
    )
  );

  constructor() {}

  getUser(): UserModel {
    return this.userSubject.getValue();
  }

  private setUser(value: UserModel): void {
    this.userSubject.next(value);
  }

  public enable2FA(value: boolean) {
    const newUser: UserModel = this.userSubject.getValue();
    newUser.is2FAEnabled = value;
    this.setUser(newUser);
  }

  public activateAccount() {
    const newUser: UserModel = this.userSubject.getValue();
    newUser.isAccountActivated = true;
    this.setUser(newUser);
  }

  public loanPaid(value: boolean) {
    const newUser: UserModel = this.userSubject.getValue();
    newUser.isLoadPaid = value;
    this.setUser(newUser);
  }
}
