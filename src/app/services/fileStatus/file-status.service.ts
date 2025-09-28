

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileStatus } from '../../models/filleStatus.model';

@Injectable({
  providedIn: 'root'
})
export class FileStatusService {

  private BASE_URL = 'https://localhost:54525/api/FileStatus';

   constructor(private http: HttpClient) {}

   getAll(): Observable<FileStatus[]> {
    return this.http.get<FileStatus[]>(this.BASE_URL);
  }


}
