import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportControlData {
  ImportControlId: number;
  ImportDataSourceDesc: string;
  System: string;
  DataSourceType: string;
  JobName: string;
  TableName: string;
  StartTime: Date;
  EndTime: Date;
  Status: string;
  TotalRows: number;
  TotalRowsAffected: number;
  RowsInvalid: number;
  FileName: string;
  UrlFileAfterProcess: string;
  ErrorReportPath: string;
}

export interface ImportError {
  ErrorRow: number;
  ErrorColumn: string;
  ErrorValue: string;
  ErrorDetail: string;
  ImportErrorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImportControlService {

  constructor(private http: HttpClient) { }

  // שליפת פרטי קליטה
  getImportControlData(importControlId: number): Observable<ImportControlData> {
    return this.http.get<ImportControlData>(`/api/import-control/${importControlId}`);
  }

  // שליפת שורות מטבלת BULK
  getBulkTableRows(tableName: string, importControlId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/bulk-table/${tableName}?importControlId=${importControlId}`);
  }

  // שליפת שגיאות
  getImportErrors(importControlId: number): Observable<ImportError[]> {
    return this.http.get<ImportError[]>(`/api/import-errors/${importControlId}`);
  }

  // שליפת כותרות בעברית
  getHebrewColumnNames(tableName: string): Observable<{[key: string]: string}> {
    return this.http.get<{[key: string]: string}>(`/api/hebrew-columns/${tableName}`);
  }

  // שליפת תיאורי שגיאות
  getErrorDescriptions(): Observable<{[key: number]: string}> {
    return this.http.get<{[key: number]: string}>('/api/error-descriptions');
  }

  // אגרגציה של שגיאות
  getErrorSummary(importControlId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/error-summary/${importControlId}`);
  }
}