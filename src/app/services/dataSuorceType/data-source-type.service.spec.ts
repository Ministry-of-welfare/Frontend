import { TestBed } from '@angular/core/testing';

import { DataSourceTypeService } from './data-source-type.service';

describe('DataSourceTypeService', () => {
  let service: DataSourceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSourceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
