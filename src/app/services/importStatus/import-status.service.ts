import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportStatus } from '../../models/importStatus.model';

@Injectable({
  providedIn: 'root'
})
export class ImportStatusService {

  private BASE_URL = 'https://localhost:54525/api/ImportStatus';

   constructor(private http: HttpClient) {}

   getAll(): Observable<ImportStatus[]> {
    return this.http.get<ImportStatus[]>(this.BASE_URL);
  }


}
