import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ImportStatus } from '../../models/importStatus.model';
import { ImportControl } from '../../models/importControl.model';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {

private importControlCache: ImportControl[] | null = null;
    private BASE_URL = 'https://localhost:54525/api/ImportControl';

     constructor(private http: HttpClient) {}
  
    getAll(forceRefresh = false): Observable<ImportControl[]> {
              if (this.importControlCache && !forceRefresh) {
                // מחזיר מה־cache אם כבר נטען
                return of(this.importControlCache);
              }
          
              // טוען מהשרת ושומר ב־cache
              return this.http.get<ImportControl[]>(this.BASE_URL).pipe(
                tap(data => this.importControlCache = data)
              );
            }

}
