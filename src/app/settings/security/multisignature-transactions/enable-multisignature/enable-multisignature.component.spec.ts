import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableMultisignatureComponent } from './enable-multisignature.component';

describe('EnableMultisignatureComponent', () => {
  let component: EnableMultisignatureComponent;
  let fixture: ComponentFixture<EnableMultisignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnableMultisignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableMultisignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
