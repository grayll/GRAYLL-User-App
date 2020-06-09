import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralActivityComponent } from './referral-activity.component';

describe('ReferralActivityComponent', () => {
  let component: ReferralActivityComponent;
  let fixture: ComponentFixture<ReferralActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferralActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
