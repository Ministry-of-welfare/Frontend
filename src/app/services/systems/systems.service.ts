import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Systems } from '../../models/systems.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class SystemsService {

    private systemsCache: Systems[] | null = null;
    private BASE_URL = 'https://localhost:54525/api/Systems';
  
     constructor(private http: HttpClient) {}
  
    //  getAll(): Observable<Systems[]> {
    //   return this.http.get<Systems[]>(this.BASE_URL);
    // }
    getAll(forceRefresh = false): Observable<Systems[]> {
    if (this.systemsCache && !forceRefresh) {
      // מחזיר מה־cache אם כבר נטען
      return of(this.systemsCache);
    }

    // טוען מהשרת ושומר ב־cache
    return this.http.get<Systems[]>(this.BASE_URL).pipe(
      tap(data => this.systemsCache = data)
    );
  }

  getSystemPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/system-performance`);
  }
}
