import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAlgoPositionsComponent } from './cancel-algo-positions.component';

describe('CancelAlgoPositionsComponent', () => {
  let component: CancelAlgoPositionsComponent;
  let fixture: ComponentFixture<CancelAlgoPositionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelAlgoPositionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelAlgoPositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
