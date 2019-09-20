import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenAlgoPositionErrorComponent } from './open-algo-position-error.component';

describe('OpenAlgoPositionErrorComponent', () => {
  let component: OpenAlgoPositionErrorComponent;
  let fixture: ComponentFixture<OpenAlgoPositionErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenAlgoPositionErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenAlgoPositionErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
