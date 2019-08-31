import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletStatsComponent } from './wallet-stats.component';

describe('WalletStatsComponent', () => {
  let component: WalletStatsComponent;
  let fixture: ComponentFixture<WalletStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
