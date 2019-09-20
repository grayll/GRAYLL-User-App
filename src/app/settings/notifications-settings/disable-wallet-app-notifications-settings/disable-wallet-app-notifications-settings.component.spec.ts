import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableWalletAppNotificationsSettingsComponent } from './disable-wallet-app-notifications-settings.component';

describe('DisableWalletAppNotificationsSettingsComponent', () => {
  let component: DisableWalletAppNotificationsSettingsComponent;
  let fixture: ComponentFixture<DisableWalletAppNotificationsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableWalletAppNotificationsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableWalletAppNotificationsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
