import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBoxesComponent } from './header-boxes.component';

describe('HeaderBoxesComponent', () => {
  let component: HeaderBoxesComponent;
  let fixture: ComponentFixture<HeaderBoxesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderBoxesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
