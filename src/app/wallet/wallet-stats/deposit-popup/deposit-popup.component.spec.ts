import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositPopupComponent } from './deposit-popup.component';

describe('DepositPopupComponent', () => {
  let component: DepositPopupComponent;
  let fixture: ComponentFixture<DepositPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
