import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawPopupComponent } from './withdraw-popup.component';

describe('WithdrawPopupComponent', () => {
  let component: WithdrawPopupComponent;
  let fixture: ComponentFixture<WithdrawPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
