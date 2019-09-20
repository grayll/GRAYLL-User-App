import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableAlgoAppNotificationsSettingsComponent } from './disable-algo-app-notifications-settings.component';

describe('DisableAlgoAppNotificationsSettingsComponent', () => {
  let component: DisableAlgoAppNotificationsSettingsComponent;
  let fixture: ComponentFixture<DisableAlgoAppNotificationsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableAlgoAppNotificationsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableAlgoAppNotificationsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
