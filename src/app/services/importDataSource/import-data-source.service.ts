import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataSourceType } from '../../models/dataSourceType.model';

@Injectable({
  providedIn: 'root'
})
export class ImportDataSourceService {

  private BASE_URL = 'https://localhost:54525/api/ImportDataSources';
    
       constructor(private http: HttpClient) {}
    
       getAll(): Observable<DataSourceType[]> {
        
        return this.http.get<DataSourceType[]>(this.BASE_URL);
      }
}
