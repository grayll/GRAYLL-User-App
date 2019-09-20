import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralNotificationItemComponent } from './general-notification-item.component';

describe('GeneralNotificationItemComponent', () => {
  let component: GeneralNotificationItemComponent;
  let fixture: ComponentFixture<GeneralNotificationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralNotificationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralNotificationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
