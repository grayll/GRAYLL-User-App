import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupHeaderComponent } from './popup-header.component';

describe('PopupHeaderComponent', () => {
  let component: PopupHeaderComponent;
  let fixture: ComponentFixture<PopupHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
