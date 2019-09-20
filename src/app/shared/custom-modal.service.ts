import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomModalService {
  private modals: any[] = [];
  private gry1NotificationsMobileScrollContainer: Element;
  private gry2NotificationsMobileScrollContainer: Element;
  private gry3NotificationsMobileScrollContainer: Element;
  private grzNotificationsMobileScrollContainer: Element;

  set gry1mobileScrollContainer(element: Element) { this.gry1NotificationsMobileScrollContainer = element; }
  get gry1mobileScrollContainer() { return this.gry1NotificationsMobileScrollContainer; }
  set gry2mobileScrollContainer(element: Element) { this.gry2NotificationsMobileScrollContainer = element; }
  get gry2mobileScrollContainer() { return this.gry2NotificationsMobileScrollContainer; }
  set gry3mobileScrollContainer(element: Element) { this.gry3NotificationsMobileScrollContainer = element; }
  get gry3mobileScrollContainer() { return this.gry3NotificationsMobileScrollContainer; }
  set grzmobileScrollContainer(element: Element) { this.grzNotificationsMobileScrollContainer = element; }
  get grzmobileScrollContainer() { return this.grzNotificationsMobileScrollContainer; }

  constructor() {}

  add(modal: any) {
    // add modal to array of active modals
    this.modals.push(modal);
  }

  remove(id: string) {
    // remove modal from array of active modals
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string) {
    // open modal specified by id
    const modal: any = this.modals.filter(x => x.id === id)[0];
    modal.open(id);
  }

  close(id: string) {
    // close modal specified by id
    const modal: any = this.modals.filter(x => x.id === id)[0];
    modal.close(id);
  }
}
