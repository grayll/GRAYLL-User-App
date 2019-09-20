import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgoNotificationItemComponent } from './algo-notification-item.component';

describe('AlgoNotificationItemComponent', () => {
  let component: AlgoNotificationItemComponent;
  let fixture: ComponentFixture<AlgoNotificationItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgoNotificationItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgoNotificationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
