import { TestBed } from '@angular/core/testing';

import { CaptureDataService } from './capture-data.service';

describe('CaptureDataService', () => {
  let service: CaptureDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
