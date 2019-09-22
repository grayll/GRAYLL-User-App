import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XlmBalanceStatusPopupComponent } from './xlm-balance-status-popup.component';

describe('XlmBalanceStatusPopupComponent', () => {
  let component: XlmBalanceStatusPopupComponent;
  let fixture: ComponentFixture<XlmBalanceStatusPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XlmBalanceStatusPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XlmBalanceStatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
