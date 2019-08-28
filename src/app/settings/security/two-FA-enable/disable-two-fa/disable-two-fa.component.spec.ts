import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableTwoFaComponent } from './disable-two-fa.component';

describe('DisableTwoFaComponent', () => {
  let component: DisableTwoFaComponent;
  let fixture: ComponentFixture<DisableTwoFaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableTwoFaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableTwoFaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
