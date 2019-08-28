import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFederationAddressComponent } from './edit-federation-address.component';

describe('EditFederationAddressComponent', () => {
  let component: EditFederationAddressComponent;
  let fixture: ComponentFixture<EditFederationAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFederationAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFederationAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
