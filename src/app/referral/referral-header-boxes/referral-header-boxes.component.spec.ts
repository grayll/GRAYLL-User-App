import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralHeaderBoxesComponent } from './referral-header-boxes.component';

describe('ReferralHeaderBoxesComponent', () => {
  let component: ReferralHeaderBoxesComponent;
  let fixture: ComponentFixture<ReferralHeaderBoxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferralHeaderBoxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralHeaderBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
