import { TestBed } from '@angular/core/testing';

import { SwUpdateNotifyService } from './sw-update-notify.service';

describe('SwUpdateNotifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SwUpdateNotifyService = TestBed.get(SwUpdateNotifyService);
    expect(service).toBeTruthy();
  });
});
