import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CaptureData } from '../../models/capture.model';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {
  private cache: CaptureData[] | null = null;
  private readonly BASE_URL = 'https://localhost:54525/api/ImportControl';

  constructor(private http: HttpClient) {}

  getAll(forceRefresh = false): Observable<CaptureData[]> {
    if (this.cache && !forceRefresh) {
      return of(this.cache);
    }
    return this.http.get<CaptureData[]>(this.BASE_URL).pipe(
      tap(data => this.cache = data),
      catchError(() => of([]))
    );
  }
}