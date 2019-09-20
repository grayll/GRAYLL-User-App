import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenAlgoPositionSuccessComponent } from './open-algo-position-success.component';

describe('OpenAlgoPositionSuccessComponent', () => {
  let component: OpenAlgoPositionSuccessComponent;
  let fixture: ComponentFixture<OpenAlgoPositionSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenAlgoPositionSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenAlgoPositionSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
