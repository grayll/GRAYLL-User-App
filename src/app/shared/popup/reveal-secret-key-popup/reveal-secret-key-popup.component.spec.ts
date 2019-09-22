import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevealSecretKeyPopupComponent } from './reveal-secret-key-popup.component';

describe('RevealSecretKeyPopupComponent', () => {
  let component: RevealSecretKeyPopupComponent;
  let fixture: ComponentFixture<RevealSecretKeyPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevealSecretKeyPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevealSecretKeyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
