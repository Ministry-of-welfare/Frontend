import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface DashboardData {
  dailyStatus: {
    pending: number;
    processing: number;
    success: number;
    failed: number;
  };
  kpis: {
    totalRuns: number;
    successRate: number;
    avgTime: string;
    medianTime: string;
    slaCompliance: number;
  };
  queue: Array<{
    sourceName: string;
    fileCount: number;
    eta: string;
    status: 'ok' | 'warning' | 'critical';
  }>;
  topErrors: Array<{
    code: string;
    description: string;
    count: number;
  }>;
  problematicSources: Array<{
    name: string;
    failureRate: number;
    status: 'warning' | 'critical';
  }>;
  throughput: {
    files: number;
    records: number;
  };
  dataQuality: {
    corruptedRows: number;
    problematicColumn: string;
  };
  alerts: Array<{
    time: string;
    message: string;
    status: 'בטיפול' | 'נפתר';
    severity: 'warning' | 'critical';
  }>;
}

export interface DashboardFilters {
  fromDate?: string;
  toDate?: string;
  system?: string;
  source?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dataSubject = new BehaviorSubject<DashboardData | null>(null);
  public data$ = this.dataSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  private get apiUrl(): string {
    return this.configService.getConfig().apiUrl;
  }

  private get requestTimeout(): number {
    return this.configService.getConfig().timeout;
  }

  private get retryAttempts(): number {
    return this.configService.getConfig().retryAttempts;
  }

  getDashboardData(filters?: DashboardFilters): Observable<DashboardData> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);
      if (filters.system) params = params.set('system', filters.system);
      if (filters.source) params = params.set('source', filters.source);
      if (filters.status) params = params.set('status', filters.status);
    }

    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, { params })
      .pipe(
        timeout(this.requestTimeout),
        retry(this.retryAttempts),
        map(data => {
          this.dataSubject.next(data);
          return data;
        }),
        catchError(this.handleError)
      );
  }

  refreshData(filters?: DashboardFilters): Observable<DashboardData> {
    return this.getDashboardData(filters);
  }

  // קבלת נתוני סטטוס בזמן אמת
  getRealTimeStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/realtime`)
      .pipe(
        timeout(this.requestTimeout),
        retry(this.retryAttempts),
        catchError(this.handleError)
      );
  }

  // בדיקת חיבור לשרת
  checkServerConnection(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/health`)
      .pipe(
        timeout(5000),
        map(() => true),
        catchError(() => throwError(() => false))
      );
  }

  // קבלת היסטוריית נתונים
  getHistoricalData(days: number = 7): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/history/${days}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // קבלת פרטי שגיאה ספציפית
  getErrorDetails(errorCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/errors/${errorCode}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // קבלת מקורות זמינים לפילטר
  getAvailableSources(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/sources`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // קבלת מערכות זמינות לפילטר
  getAvailableSystems(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/systems`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'שגיאה לא ידועה';
    
    if (error.error instanceof ErrorEvent) {
      // שגיאת צד לקוח
      errorMessage = `שגיאת רשת: ${error.error.message}`;
    } else {
      // שגיאת שרת
      switch (error.status) {
        case 0:
          errorMessage = 'אין חיבור לשרת';
          break;
        case 401:
          errorMessage = 'אין הרשאה לגישה';
          break;
        case 403:
          errorMessage = 'גישה נדחתה';
          break;
        case 404:
          errorMessage = 'השירות לא נמצא';
          break;
        case 500:
          errorMessage = 'שגיאת שרת פנימית';
          break;
        case 503:
          errorMessage = 'השירות לא זמין כרגע';
          break;
        default:
          errorMessage = `שגיאת שרת: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('Dashboard Service Error:', error);
    return throwError(() => errorMessage);
  }
}