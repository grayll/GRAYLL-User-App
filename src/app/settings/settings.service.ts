import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Security
  private twoFAEnabled: Subject<boolean>;
  private multisignatureEnabled: Subject<boolean>;

  // Notifications
  private walletNotificationsDisabled: Subject<void>;
  private algoNotificationsDisabled: Subject<void>;

  // Messages
  private walletMessagesDisabled: Subject<void>;
  private algoMessagesDisabled: Subject<void>;

  constructor() { }

  public observeTwoFAEnabled(): Observable<boolean> {
    if (!this.twoFAEnabled) {
      this.twoFAEnabled = new Subject<boolean>();
    }
    return this.twoFAEnabled.asObservable();
  }

  public sendTwoFAEnabledToObserver(enable: boolean): void {
    if (!this.twoFAEnabled) {
      this.twoFAEnabled = new Subject<boolean>();
    }
    this.twoFAEnabled.next(enable);
  }

  public observeMultisignatureEnabled(): Observable<boolean> {
    if (!this.multisignatureEnabled) {
      this.multisignatureEnabled = new Subject<boolean>();
    }
    return this.multisignatureEnabled.asObservable();
  }

  public sendMultisignatureEnabledToObserver(enable: boolean): void {
    if (!this.multisignatureEnabled) {
      this.multisignatureEnabled = new Subject<boolean>();
    }
    this.multisignatureEnabled.next(enable);
  }

  public observeWalletNotificationsDisabled(): Observable<void> {
    if (!this.walletNotificationsDisabled) {
      this.walletNotificationsDisabled = new Subject<void>();
    }
    return this.walletNotificationsDisabled.asObservable();
  }

  public sendWalletNotificationsDisabled(): void {
    if (!this.walletNotificationsDisabled) {
      this.walletNotificationsDisabled = new Subject<void>();
    }
    this.walletNotificationsDisabled.next();
  }

  public observeAlgoNotificationsDisabled(): Observable<void> {
    if (!this.algoNotificationsDisabled) {
      this.algoNotificationsDisabled = new Subject<void>();
    }
    return this.algoNotificationsDisabled.asObservable();
  }

  public sendAlgoNotificationsDisabled(): void {
    if (!this.algoNotificationsDisabled) {
      this.algoNotificationsDisabled = new Subject<void>();
    }
    this.algoNotificationsDisabled.next();
  }

  public observeWalletMessagesDisabled(): Observable<void> {
    if (!this.walletMessagesDisabled) {
      this.walletMessagesDisabled = new Subject<void>();
    }
    return this.walletMessagesDisabled.asObservable();
  }

  public sendWalletMessagesDisabled(): void {
    if (!this.walletMessagesDisabled) {
      this.walletMessagesDisabled = new Subject<void>();
    }
    this.walletMessagesDisabled.next();
  }

  public observeAlgoMessagesDisabled(): Observable<void> {
    if (!this.algoMessagesDisabled) {
      this.algoMessagesDisabled = new Subject<void>();
    }
    return this.algoMessagesDisabled.asObservable();
  }

  public sendAlgoMessagesDisabled(): void {
    if (!this.algoMessagesDisabled) {
      this.algoMessagesDisabled = new Subject<void>();
    }
    this.algoMessagesDisabled.next();
  }

}
