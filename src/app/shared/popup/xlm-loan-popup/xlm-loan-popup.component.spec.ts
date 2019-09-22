import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmLoanPopupComponent } from './xlm-loan-popup.component';

describe('XlmLoanPopupComponent', () => {
  let component: XlmLoanPopupComponent;
  let fixture: ComponentFixture<XlmLoanPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmLoanPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmLoanPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
