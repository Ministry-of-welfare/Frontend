import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportStatus } from '../../models/importStatus.model';
import { ImportControl } from '../../models/importControl.model';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {


    private BASE_URL = 'https://localhost:54525/api/ImportControl';

     constructor(private http: HttpClient) {}
  
     getAll(): Observable<ImportControl[]> {
      console.log("import    ")
      return this.http.get<ImportControl[]>(this.BASE_URL);
    }

}
