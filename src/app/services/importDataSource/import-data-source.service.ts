import { HttpClient, HttpParams } from '@angular/common/http';
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

 createTable(importDataSourceId: number): Observable<any> {
    return this.http.post(`${this.BASE_URL}/${importDataSourceId}/create-table`, {}, { responseType: 'text' });
  }
  getAll(): Observable<ImportDataSources[]> {
    return this.http.get<ImportDataSources[]>(this.BASE_URL);
  }

  addImportDataSource(importDataSource: ImportDataSources): Observable<Number> {
    return this.http.post<Number>(`${this.BASE_URL}/CreateAndReturnId`, importDataSource);
  }

  updateImportDataSource(importDataSource: ImportDataSources): Observable<ImportDataSources> {
    return this.http.put<ImportDataSources>(`${this.BASE_URL}/${importDataSource.importDataSourceId}`, importDataSource);
  }

  updateTheEndDate(id: number): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/updateJustEndDate/${id}`, {});
  }
  
  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/statuses`);
  }
  
  getTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/types`);
  }
  
  getSystems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/systems`);
  }
  
  search(filters: any): Observable<ImportDataSources[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.system) params = params.set('system', filters.system);
    if (filters.search) params = params.set('search', filters.search);
    
    return this.http.get<ImportDataSources[]>(`${this.BASE_URL}/search`, { params });
  }
}
