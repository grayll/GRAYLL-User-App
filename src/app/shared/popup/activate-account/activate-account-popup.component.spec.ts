import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateAccountPopupComponent } from './activate-account-popup.component';

describe('ActivateAccountPopupComponent', () => {
  let component: ActivateAccountPopupComponent;
  let fixture: ComponentFixture<ActivateAccountPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateAccountPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateAccountPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
