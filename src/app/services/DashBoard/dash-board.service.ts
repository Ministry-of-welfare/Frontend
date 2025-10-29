import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface DataQualityKpi {
  importControlId: number;
  totalRows: number;
  rowsInvalid: number;
  validRowsPercentage: number;
}
export interface DataVolumeResponse {
  totalRows: number;
  dataVolumeInGB: string;
}

// חדש: ממשק לספירת סטטוסים שמשרת מחזיר
export interface StatusCounts {
  waiting?: number;
  inprogress?: number;
  success?: number;
  error?: number;
  // אופציונלי - אם השרת מחזיר סיכומים נוספים
  totalToday?: number;
  successRate?: number;
  avgProcessTime?: number;
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
  
  /**
   * נתוני נפח הנתונים ומספר הרשומות
   */
  getDataVolume(searchParams?: any): Observable<DataVolumeResponse> {
    let params = new HttpParams();

    if (searchParams) {
      Object.keys(searchParams).forEach(key => {
        const val = searchParams[key];
        if (val !== null && val !== undefined && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }

    return this.http.get<DataVolumeResponse>(`${this.apiUrl}/DataVolume`, { params });
  }
  
  /**
   * קבלת ספירות סטטוסים (waiting,inprogress,success,error) ו/או סיכומים נוספים
   */
  getStatusCounts(filter?: { startDate?: string; endDate?: string; systemId?: number; importDataSourceId?: number }) {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.systemId !== undefined && filter.systemId !== null) params = params.set('systemId', String(filter.systemId));
      if (filter.importDataSourceId !== undefined && filter.importDataSourceId !== null) params = params.set('importDataSourceId', String(filter.importDataSourceId));
    }

    return this.http.get<StatusCounts>(`${this.apiUrl}/statusCounts`, { params });
  }


  // קריאה ישירה ל /imports-count שמחזירה { importsCount: number }
  getImportsCount(filter?: { statusId?: number; startDate?: string; endDate?: string }) {
    let params = new HttpParams();
    if (filter) {
      if (filter.statusId !== undefined && filter.statusId !== null) params = params.set('statusId', String(filter.statusId));
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }
    return this.http.get<{ importsCount: number }>(`${this.apiUrl}/imports-count`, { params })
      .pipe(map(res => res?.importsCount ?? 0));
  }
  getsuccessRate(filter?: { startDate?: string; endDate?: string; systemId?: number; importDataSourceId?: number }) {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.systemId !== undefined && filter.systemId !== null) params = params.set('systemId', String(filter.systemId));
      if (filter.importDataSourceId !== undefined && filter.importDataSourceId !== null) params = params.set('importDataSourceId', String(filter.importDataSourceId));
    }

    return this.http.get<StatusCounts>(`${this.apiUrl}/success-rate`, { params });
  }

getAvgProcessingTime(filter?: { startDate?: string; endDate?: string; systemId?: number; importDataSourceId?: number }) {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.systemId !== undefined && filter.systemId !== null) params = params.set('systemId', String(filter.systemId));
      if (filter.importDataSourceId !== undefined && filter.importDataSourceId !== null) params = params.set('importDataSourceId', String(filter.importDataSourceId));
    }

    return this.http.get<StatusCounts>(`${this.apiUrl}/avg-processing-time`, { params });
  }

}
