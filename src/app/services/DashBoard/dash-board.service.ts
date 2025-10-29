import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface DataQualityKpi {
  importControlId: number;
  totalRows: number;
  rowsInvalid: number;
  validRowsPercentage: number;
  duplicateRows?: number; // 🟢 שדה אופציונלי חדש
}

export interface DataVolumeResponse {
  totalRows: number;
  dataVolumeInGB: string;
}

// חדש: ממשק לספירת סטטוסים שמשרת מחזיר
export interface StatusCounts {
  waiting?: number;
  inProgress?: number;
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
  // getDataQualityKpis(params?: any): Observable<any> {  
  //   return this.http.get(`${this.apiUrl}/data-quality-simple`, { params });
  // }
  getDataQualityKpis(filter?: {
    statusId?: number;
    importDataSourceId?: number;
    systemId?: number;
    startDate?: string;
    endDate?: string
  }): Observable<DataQualityKpi[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.statusId !== undefined && filter.statusId !== null) {
        params = params.set('importStatusId', String(filter.statusId)); // 👈 חשוב! ב־API זה נקרא importStatusId
      }
      if (filter.importDataSourceId !== undefined && filter.importDataSourceId !== null) {
        params = params.set('importDataSourceId', String(filter.importDataSourceId));
      }
      if (filter.systemId !== undefined && filter.systemId !== null) {
        params = params.set('systemId', String(filter.systemId));
      }
      if (filter.startDate) {
        params = params.set('startDate', filter.startDate);
      }
      if (filter.endDate) {
        params = params.set('endDate', filter.endDate);
      }
    }

    return this.http.get<DataQualityKpi[]>(`${this.apiUrl}/data-quality-simple`, { params });
  }

  /**
   * נתוני נפח הנתונים ומספר הרשומות
   */
  getDataVolume(): Observable<DataVolumeResponse> {
    return this.http.get<DataVolumeResponse>(`${this.apiUrl}/DataVolume`);
  }

  /**
   * קבלת ספירות סטטוסים (waiting,inprogress,success,error) ו/או סיכומים נוספים
   */
  getStatusCounts(filter?: { startDate?: string; endDate?: string; systemId?: number; importDataSourceId?: number }) {
    let params = new HttpParams();
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.systemId !== undefined && filter.systemId !== null && !isNaN(filter.systemId)) {
        params = params.set('systemId', String(filter.systemId));}
      if (filter.importDataSourceId !== undefined && filter.importDataSourceId !== null && !isNaN(filter.importDataSourceId)) {
        params = params.set('importDataSourceId', String(filter.importDataSourceId));
      }
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
