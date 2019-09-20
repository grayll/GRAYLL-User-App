import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelActiveOrdersPopupComponent } from './cancel-active-orders-popup.component';

describe('CancelActiveOrdersPopupComponent', () => {
  let component: CancelActiveOrdersPopupComponent;
  let fixture: ComponentFixture<CancelActiveOrdersPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelActiveOrdersPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelActiveOrdersPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
