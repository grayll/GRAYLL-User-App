import { TestBed } from '@angular/core/testing';

import { AlgoPositionService } from './algo-position.service';

describe('AlgoPositionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlgoPositionService = TestBed.get(AlgoPositionService);
    expect(service).toBeTruthy();
  });
});
