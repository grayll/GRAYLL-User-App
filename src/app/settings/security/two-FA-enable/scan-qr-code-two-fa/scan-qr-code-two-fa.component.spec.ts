import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanQrCodeTwoFaComponent } from './scan-qr-code-two-fa.component';

describe('ScanQrCodeTwoFaComponent', () => {
  let component: ScanQrCodeTwoFaComponent;
  let fixture: ComponentFixture<ScanQrCodeTwoFaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanQrCodeTwoFaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanQrCodeTwoFaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
