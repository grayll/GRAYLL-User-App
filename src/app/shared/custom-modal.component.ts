import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import {CustomModalService} from './custom-modal.service';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';


@Component({
  selector: 'app-jw-modal',
  template:
    `<div class="jw-modal">
            <div class="jw-modal-body">
                <ng-content></ng-content>
            </div>
        </div>
        <div class="jw-modal-background"></div>`,
  styleUrls: [
    './custom-modal.scss'
  ]
})
export class CustomModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  private element: any;

  constructor(private modalService: CustomModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    const modal = this;

    // ensure id attribute exists
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    document.body.appendChild(this.element);

    // to close modal on background click
    // this.element.addEventListener('click', (e: any) => {
    //   if (e.target.className === 'jw-modal') {
    //     modal.close();
    //   }
    // });

    // add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);
  }

  // remove self from modal service when component is destroyed
  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  private enableBackgroundScroll(id: string, enable: boolean) {
    const e = enable;
    switch (id) {
      case 'unread-gry1-notifications':
        e ? enableBodyScroll(this.modalService.gry1mobileScrollContainer) : disableBodyScroll(this.modalService.gry1mobileScrollContainer);
        break;
      case 'unread-gry2-notifications':
        e ? enableBodyScroll(this.modalService.gry2mobileScrollContainer) : disableBodyScroll(this.modalService.gry2mobileScrollContainer);
        break;
      case 'unread-gry3-notifications':
        e ? enableBodyScroll(this.modalService.gry3mobileScrollContainer) : disableBodyScroll(this.modalService.gry3mobileScrollContainer);
        break;
      default:
        e ? enableBodyScroll(this.modalService.grzmobileScrollContainer) : disableBodyScroll(this.modalService.grzmobileScrollContainer);
        break;
    }
  }

  open(id: string): void {
    this.element.style.display = 'block';
    document.body.classList.add('jw-modal-open');
    this.enableBackgroundScroll(id, false);
  }

  close(id: string): void {
    this.element.style.display = 'none';
    document.body.classList.remove('jw-modal-open');
    this.enableBackgroundScroll(id, true);
  }
}
