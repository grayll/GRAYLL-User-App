import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawSuccessPopupComponent } from './withdraw-success-popup.component';

describe('WithdrawSuccessPopupComponent', () => {
  let component: WithdrawSuccessPopupComponent;
  let fixture: ComponentFixture<WithdrawSuccessPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawSuccessPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawSuccessPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
