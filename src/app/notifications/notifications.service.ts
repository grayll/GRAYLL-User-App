import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private numberOfUnreadAlgoNotifications: number;
  private numberOfUnreadWalletNotifications: number;
  private numberOfUnreadSystemNotifications: number;
  private numberOfAllUnreadNotifications: number;
  private numberOfUnreadGRY1Notifications: number;
  private numberOfUnreadGRY2Notifications: number;
  private numberOfUnreadGRY3Notifications: number;
  private numberOfUnreadGRZNotifications: number;
  private numberOfUnreadGrayllSystemNotifications: number;

  constructor() {
    this.resetNumberOfAllUnreadNotifications();
    this.resetNumberOfAllGrayllSystemNotifications();
  }

  getNumberOfAllUnreadNotifications() {
    return this.numberOfAllUnreadNotifications;
  }

  increaseNumberOfAllUnreadNotificationsBy(count: number) {
    this.numberOfAllUnreadNotifications += count;
  }

  decreaseNumberOfAllUnreadNotifications() {
    if (this.numberOfAllUnreadNotifications > 0) {
      this.numberOfAllUnreadNotifications--;
    }
  }

  resetNumberOfAllUnreadNotifications() {
    this.numberOfAllUnreadNotifications = 0;
  }

  /* NOTIFICATIONS PAGE */

  // Algo Notifications
  setNumberOfUnreadAlgoNotifications(count: number) {
    this.numberOfUnreadAlgoNotifications = count;
  }

  getNumberOfUnreadAlgoNotifications() {
    return this.numberOfUnreadAlgoNotifications;
  }

  decreaseNumberOfUnreadAlgoNotifications() {
    if (this.numberOfUnreadAlgoNotifications > 0) {
      this.numberOfUnreadAlgoNotifications--;
    }
  }

  // Wallet Notifications
  setNumberOfUnreadWalletNotifications(count: number) {
    this.numberOfUnreadWalletNotifications = count;
  }

  getNumberOfUnreadWalletNotifications() {
    return this.numberOfUnreadWalletNotifications;
  }

  decreaseNumberOfUnreadWalletNotifications() {
    if (this.numberOfUnreadWalletNotifications > 0) {
      this.numberOfUnreadWalletNotifications--;
    }
  }

  // System Notifications
  setNumberOfUnreadSystemNotifications(count: number) {
    this.numberOfUnreadSystemNotifications = count;
  }

  getNumberOfUnreadSystemNotifications() {
    return this.numberOfUnreadSystemNotifications;
  }

  decreaseNumberOfUnreadSystemNotifications() {
    if (this.numberOfUnreadSystemNotifications > 0) {
      this.numberOfUnreadSystemNotifications--;
    }
  }

  /* ALGO SYSTEM PAGE */

  // Overall

  getNumberOfUnreadGrayllSystemNotifications() {
    return this.numberOfUnreadGrayllSystemNotifications;
  }

  increaseNumberOfAllGrayllSystemNotificationsBy(count: number) {
    this.numberOfUnreadGrayllSystemNotifications += count;
  }

  decreaseNumberOfAllGrayllSystemdNotifications() {
    if (this.numberOfUnreadGrayllSystemNotifications > 0) {
      this.numberOfUnreadGrayllSystemNotifications--;
    }
  }

  resetNumberOfAllGrayllSystemNotifications() {
    this.numberOfUnreadGrayllSystemNotifications = 0;
  }

  // GRY1
  set numberOfGRY1Notifications(count: number) { this.numberOfUnreadGRY1Notifications = count; }
  get numberOfGRY1Notifications() { return this.numberOfUnreadGRY1Notifications; }
  decreaseNumberOfGRY1Notifications() {
    if (this.numberOfGRY1Notifications > 0) {
      this.numberOfGRY1Notifications--;
    }
  }

  // GRY2
  set numberOfGRY2Notifications(count: number) { this.numberOfUnreadGRY2Notifications = count; }
  get numberOfGRY2Notifications() { return this.numberOfUnreadGRY2Notifications; }
  decreaseNumberOfGRY2Notifications() {
    if (this.numberOfGRY2Notifications > 0) {
      this.numberOfGRY2Notifications--;
    }
  }

  // GRY3
  set numberOfGRY3Notifications(count: number) { this.numberOfUnreadGRY3Notifications = count; }
  get numberOfGRY3Notifications() { return this.numberOfUnreadGRY3Notifications; }
  decreaseNumberOfGRY3Notifications() {
    if (this.numberOfGRY3Notifications > 0) {
      this.numberOfGRY3Notifications--;
    }
  }

  // GRZ
  set numberOfGRZNotifications(count: number) { this.numberOfUnreadGRZNotifications = count; }
  get numberOfGRZNotifications() { return this.numberOfUnreadGRZNotifications; }
  decreaseNumberOfGRZNotifications() {
    if (this.numberOfGRZNotifications > 0) {
      this.numberOfGRZNotifications--;
    }
  }

}
