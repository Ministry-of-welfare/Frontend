import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface DataQualityKpi {
  importControlId: number;
  totalRows: number;
  rowsInvalid: number;
  validRowsPercentage: number;
}

@Injectable({
  providedIn: 'root'
})

export class DashboardApiService {
  private baseUrl = 'https://localhost:54525/api/Dashboard/data-quality-simple';

  constructor(private http: HttpClient) { }

getDataQualityKpis(): Observable<any[]> {
  return this.http.get<any[]>(this.baseUrl);
}



}
