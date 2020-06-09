import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmReferralRemovePopupComponent } from './xlm-referral-remove-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmReferralRemovePopupComponent;
  let fixture: ComponentFixture<XlmReferralRemovePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmReferralRemovePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmReferralRemovePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
