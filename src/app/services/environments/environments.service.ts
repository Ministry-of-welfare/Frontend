import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentsService {
  private BASE_URL = 'https://localhost:54525/api/Environments';
 

<<<<<<< HEAD

=======
>>>>>>> 93b526501e3cf6c68a0ac5e76eec4bb31bcab239

  constructor(private http: HttpClient) {}

  getAll(): Observable<Environment[]> {
    return this.http.get<Environment[]>(this.BASE_URL+'/getAll');
  }

  
  getById(id: number): Observable<Environment> {
    return this.http.get<Environment>(`${this.BASE_URL}/get/${id}`);
  }

  create(environment: Environment): Observable<Environment> {
    return this.http.post<Environment>(this.BASE_URL + '/create', environment);
  }

  update(environment: Environment): Observable<Environment> {
    return this.http.put<Environment>(`${this.BASE_URL}/update/${environment.environmentId}`, environment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/delete/${id}`);
  }
}