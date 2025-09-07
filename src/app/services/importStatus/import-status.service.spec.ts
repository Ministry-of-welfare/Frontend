import { TestBed } from '@angular/core/testing';

import { ImportStatusService } from './import-status.service';

describe('ImportStatusService', () => {
  let service: ImportStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
