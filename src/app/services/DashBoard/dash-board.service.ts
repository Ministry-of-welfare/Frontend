import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface DataQualityKpi {
  importControlId: number;
  totalRows: number;
  rowsInvalid: number;
  validRowsPercentage: number;
}
@Injectable({
  providedIn: 'root'
})
export class DashBoardService {
  private apiUrl = 'https://localhost:54525/api/Dashboard';

  constructor(private http: HttpClient) { }

  getTopErrors(searchParams?: any): Observable<any> {
    let params = new HttpParams();
    
    if (searchParams) {
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] !== null && searchParams[key] !== undefined) {
          params = params.set(key, searchParams[key]);
        }
      });
    }

    return this.http.get(`${this.apiUrl}/top-errors`, { params });
  }
  getDataQualityKpis(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/data-quality-simple`);
}
}
