import { Injectable } from '@angular/core';
 import { HttpClient } from '@angular/common/http';
  import { Observable, of, tap } from 'rxjs';
  import { DataSourceType } from '../../models/dataSourceType.model';
import { CaptureData } from '../../models/capture.model';
  
@Injectable({
  providedIn: 'root'
})
export class CaptureDataService {



 
 
   private  CaptureDataCache: CaptureData[] | null = null;
     private BASE_URL = 'https://localhost:54525/api/ImportDataSources/search';

          constructor(private http: HttpClient) {}

          getAll(forceRefresh = false): Observable<CaptureData[]> {
           if (this.CaptureDataCache && !forceRefresh) {
             // מחזיר מה־cache אם כבר נטען
             return of(this.CaptureDataCache);
           }
         
             // טוען מהשרת ושומר ב־cache
             return this.http.get<CaptureData[]>(this.BASE_URL).pipe(
               tap(data => this.CaptureDataCache = data)
             );
           }
  }
  

