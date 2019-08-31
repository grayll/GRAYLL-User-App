import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawErrorPopupComponent } from './withdraw-error-popup.component';

describe('WithdrawErrorPopupComponent', () => {
  let component: WithdrawErrorPopupComponent;
  let fixture: ComponentFixture<WithdrawErrorPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawErrorPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawErrorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
