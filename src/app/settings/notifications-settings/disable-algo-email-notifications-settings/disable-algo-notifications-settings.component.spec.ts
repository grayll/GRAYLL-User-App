import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableAlgoNotificationsSettingsComponent } from './disable-algo-notifications-settings.component';

describe('DisableAlgoNotificationsSettingsComponent', () => {
  let component: DisableAlgoNotificationsSettingsComponent;
  let fixture: ComponentFixture<DisableAlgoNotificationsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableAlgoNotificationsSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableAlgoNotificationsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
