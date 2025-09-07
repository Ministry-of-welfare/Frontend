import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Systems } from '../../models/systems.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemsService {

  
    private BASE_URL = 'https://localhost:54525/api/systems';
  
     constructor(private http: HttpClient) {}
  
     getAll(): Observable<Systems[]> {
      return this.http.get<Systems[]>(this.BASE_URL+'/getAll');
    }
}
