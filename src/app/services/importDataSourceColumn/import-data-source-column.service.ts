import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImportDataSourceColumn } from '../../models/importDataSourceColumn.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportDataSourceColumnService {

  private BASE_URL = 'https://localhost:54525/api/ImportDataSourceColumn';
  
    constructor(private http: HttpClient) { }

    // getAll(): Observable<ImportDataSourceColumn[]> {
    //   return this.http.get<ImportDataSourceColumn[]>(this.BASE_URL);
    // }

    addImportDataSource(ImportDataSourceColumn: ImportDataSourceColumn): Observable<ImportDataSourceColumn> {
      return this.http.post<ImportDataSourceColumn>(`${this.BASE_URL}`, ImportDataSourceColumn);
    }
  
  
}
