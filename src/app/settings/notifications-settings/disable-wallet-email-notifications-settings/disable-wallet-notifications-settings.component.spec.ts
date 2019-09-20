import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableWalletNotificationsSettingsComponent } from './disable-wallet-notifications-settings.component';

describe('DisableWalletNotificationsSettingsComponent', () => {
  let component: DisableWalletNotificationsSettingsComponent;
  let fixture: ComponentFixture<DisableWalletNotificationsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableWalletNotificationsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableWalletNotificationsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
