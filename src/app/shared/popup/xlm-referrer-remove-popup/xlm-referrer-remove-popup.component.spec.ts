import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmReferrerRemovePopupComponent } from './xlm-referrer-remove-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmReferrerRemovePopupComponent;
  let fixture: ComponentFixture<XlmReferrerRemovePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmReferrerRemovePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmReferrerRemovePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
