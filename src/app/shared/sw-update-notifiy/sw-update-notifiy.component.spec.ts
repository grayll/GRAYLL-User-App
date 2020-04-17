import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwUpdateNotifiyComponent } from './sw-update-notifiy.component';

describe('SwUpdateNotifiyComponent', () => {
  let component: SwUpdateNotifiyComponent;
  let fixture: ComponentFixture<SwUpdateNotifiyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwUpdateNotifiyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwUpdateNotifiyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
