import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletNotificationItemComponent } from './wallet-notification-item.component';

describe('WalletNotificationItemComponent', () => {
  let component: WalletNotificationItemComponent;
  let fixture: ComponentFixture<WalletNotificationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletNotificationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletNotificationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
