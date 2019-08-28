import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableTwoFaLastStepComponent } from './enable-two-fa-last-step.component';

describe('EnableTwoFaLastStepComponent', () => {
  let component: EnableTwoFaLastStepComponent;
  let fixture: ComponentFixture<EnableTwoFaLastStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableTwoFaLastStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableTwoFaLastStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
