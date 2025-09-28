import { TestBed } from '@angular/core/testing';

import { FileStatusService } from './file-status.service';

describe('FileStatusService', () => {
  let service: FileStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
