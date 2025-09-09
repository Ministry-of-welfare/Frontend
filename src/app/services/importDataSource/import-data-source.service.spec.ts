import { TestBed } from '@angular/core/testing';

import { ImportDataSourceService } from './import-data-source.service';

describe('ImportDataSourceService', () => {
  let service: ImportDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
