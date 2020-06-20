import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmReferralResendPopupComponent } from './xlm-referral-resend-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmReferralResendPopupComponent;
  let fixture: ComponentFixture<XlmReferralResendPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmReferralResendPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmReferralResendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
