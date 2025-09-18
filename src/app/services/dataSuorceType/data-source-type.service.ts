import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { DataSourceType } from '../../models/dataSourceType.model';

@Injectable({
  providedIn: 'root'
})
export class DataSourceTypeService {
private DataTypeCache: DataSourceType[] | null = null;
  private BASE_URL = 'https://localhost:54525/api/DataSourceTypes';
    
       constructor(private http: HttpClient) {}
    
       getAll(forceRefresh = false): Observable<DataSourceType[]> {
           if (this.DataTypeCache && !forceRefresh) {
             // מחזיר מה־cache אם כבר נטען
             return of(this.DataTypeCache);
           }
       
           // טוען מהשרת ושומר ב־cache
           return this.http.get<DataSourceType[]>(this.BASE_URL).pipe(
             tap(data => this.DataTypeCache = data)
           );
         }
}
