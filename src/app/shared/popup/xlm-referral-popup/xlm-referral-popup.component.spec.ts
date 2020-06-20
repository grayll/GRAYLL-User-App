import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmReferralPopupComponent } from './xlm-referral-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmReferralPopupComponent;
  let fixture: ComponentFixture<XlmReferralPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmReferralPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmReferralPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
