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

  // Downloads a file by providing the absolute local path on the server machine.
  // NOTE: The backend must expose an endpoint to stream files from disk. Example:
  // GET https://.../api/ImportControl/download-by-path?path={encodedPath}
  // The endpoint should return the file bytes with appropriate Content-Type and Content-Disposition.
  downloadFileByPath(path: string) {
    const url = `${this.BASE_URL}/download-by-path?path=${encodeURIComponent(path)}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  // Downloads a file associated with a specific ImportControl id.
  // Example endpoint: GET https://.../api/ImportControl/{id}/file
  downloadFileById(id: number) {
    const url = `${this.BASE_URL}/${id}/file`;
    return this.http.get(url, { responseType: 'blob' });
  }
}