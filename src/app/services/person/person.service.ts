import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Person } from '../../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private BASE_URL = 'https://localhost:7274';

  constructor(private http: HttpClient) {} // ✅ הזרקת HttpClient תקינה

  getAll(): Observable<Person[]> {
    return this.http.get<Person[]>(this.BASE_URL + '/getAll');
  }
}
