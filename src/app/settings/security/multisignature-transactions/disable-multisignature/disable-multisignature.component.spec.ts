import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableMultisignatureComponent } from './disable-multisignature.component';

describe('DisableMultisignatureComponent', () => {
  let component: DisableMultisignatureComponent;
  let fixture: ComponentFixture<DisableMultisignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableMultisignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableMultisignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
