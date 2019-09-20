import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHeaderBoxesComponent } from './system-header-boxes.component';

describe('SystemHeaderBoxesComponent', () => {
  let component: SystemHeaderBoxesComponent;
  let fixture: ComponentFixture<SystemHeaderBoxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemHeaderBoxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemHeaderBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
