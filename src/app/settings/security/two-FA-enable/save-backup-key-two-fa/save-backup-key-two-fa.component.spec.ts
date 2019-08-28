import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveBackupKeyTwoFaComponent } from './save-backup-key-two-fa.component';

describe('SaveBackupKeyTwoFaComponent', () => {
  let component: SaveBackupKeyTwoFaComponent;
  let fixture: ComponentFixture<SaveBackupKeyTwoFaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveBackupKeyTwoFaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveBackupKeyTwoFaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
