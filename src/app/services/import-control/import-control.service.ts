import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportControl {
  importControlId: number;
  source: string;
  system: string;
  fileName: string;
  importStartDate?: string;
  endDate?: string;
  total: number;
  loaded: number;
  failed: number;
  importStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportControlService {
  private readonly BASE_URL = 'https://localhost:54525/api/ImportControl';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ImportControl[]> {
    return this.http.get<ImportControl[]>(this.BASE_URL);
  }

  getById(id: number): Observable<ImportControl> {
    return this.http.get<ImportControl>(`${this.BASE_URL}/${id}`);
  }

  create(importControl: ImportControl): Observable<ImportControl> {
    return this.http.post<ImportControl>(this.BASE_URL, importControl);
  }

  update(id: number, importControl: ImportControl): Observable<void> {
    return this.http.put<void>(`${this.BASE_URL}/${id}`, importControl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
