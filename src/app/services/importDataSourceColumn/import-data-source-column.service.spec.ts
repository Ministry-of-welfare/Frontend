import { TestBed } from '@angular/core/testing';

import { ImportDataSourceColumnService } from './import-data-source-column.service';

describe('ImportDataSourceColumnService', () => {
  let service: ImportDataSourceColumnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportDataSourceColumnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
