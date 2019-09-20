import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataHeaderBoxesComponent } from './data-header-boxes.component';

describe('DataHeaderBoxesComponent', () => {
  let component: DataHeaderBoxesComponent;
  let fixture: ComponentFixture<DataHeaderBoxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataHeaderBoxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataHeaderBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
