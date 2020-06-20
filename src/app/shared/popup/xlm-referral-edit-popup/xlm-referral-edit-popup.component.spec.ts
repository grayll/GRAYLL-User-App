import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmReferralEditPopupComponent } from './xlm-referral-edit-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmReferralEditPopupComponent;
  let fixture: ComponentFixture<XlmReferralEditPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmReferralEditPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmReferralEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
