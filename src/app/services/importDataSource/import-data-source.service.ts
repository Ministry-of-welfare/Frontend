import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSourceType } from '../../models/dataSourceType.model';
import { ImportDataSources } from '../../models/importDataSources.model';
import { ImportStatus } from '../../models/importStatus.model';

@Injectable({
  providedIn: 'root'
})
export class ImportDataSourceService {

  private BASE_URL = 'https://localhost:54525/api/ImportDataSources';

  constructor(private http: HttpClient) { }

  getAll(): Observable<ImportDataSources[]> {
    return this.http.get<ImportDataSources[]>(this.BASE_URL);
  }

  addImportDataSource(importDataSource: ImportDataSources): Observable<ImportDataSources> {
    return this.http.post<ImportDataSources>(`${this.BASE_URL}/create`, importDataSource);
  }

  updateImportDataSource(importDataSource: ImportDataSources): Observable<ImportDataSources> {
    return this.http.put<ImportDataSources>(`${this.BASE_URL}/${importDataSource.importDataSourceId}`, importDataSource);
  }

  updateTheEndDate(id: number): Observable<void> {
  return this.http.put<void>(`${this.BASE_URL}/updateJustEndDate/${id}`, {});
}
}
