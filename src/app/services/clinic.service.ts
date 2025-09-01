import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Clinic } from '../models/clinic.model';


@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private BASE_URL = 'https://localhost:7215/api/Clinic';

  constructor(private http: HttpClient) {} // ✅ הזרקת HttpClient תקינה

  getAll(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(this.BASE_URL + '/getAll');
  }
}
