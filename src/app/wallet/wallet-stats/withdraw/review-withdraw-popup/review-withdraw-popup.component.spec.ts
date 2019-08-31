import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewWithdrawPopupComponent } from './review-withdraw-popup.component';

describe('ReviewWithdrawPopupComponent', () => {
  let component: ReviewWithdrawPopupComponent;
  let fixture: ComponentFixture<ReviewWithdrawPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewWithdrawPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewWithdrawPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
