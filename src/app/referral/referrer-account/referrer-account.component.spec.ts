import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferrerAccountComponent } from './referrer-account.component';

describe('ReferrerAccountComponent', () => {
  let component: ReferrerAccountComponent;
  let fixture: ComponentFixture<ReferrerAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferrerAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferrerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
