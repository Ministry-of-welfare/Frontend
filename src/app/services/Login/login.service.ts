import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export enum PermissionType {
  VIEW_ONLY = 'VIEW_ONLY',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN'
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly API_URL = 'https://localhost:54525/api/Auth';
  private currentPermission: PermissionType = PermissionType.VIEW_ONLY;
  private token: string | null = null;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          this.token = response.token;
          localStorage.setItem('authToken', response.token);
          this.currentPermission = this.mapPermission(response.role || response.permission);
          this.isLoggedInSubject.next(true);
          alert(this.token)
        }
      })
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    this.currentPermission = PermissionType.VIEW_ONLY;
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('authToken');
    if (this.token) {
      this.isLoggedInSubject.next(true);
    }
  }

  private mapPermission(role: string): PermissionType {
    switch (role?.toLowerCase()) {
      case 'admin': return PermissionType.ADMIN;
      case 'edit': return PermissionType.EDIT;
      default: return PermissionType.VIEW_ONLY;
    }
  }

  // פונקציה נוחה לקריאה ישירה
  loginUser(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.login(username, password).subscribe({
        next: () => resolve(true),
        error: (err) => reject(err)
      });
    });
  }

  getCurrentPermission(): PermissionType {
    return this.currentPermission;
  }

  canEdit(): boolean {
    return this.currentPermission === PermissionType.EDIT || this.currentPermission === PermissionType.ADMIN;
  }

  canDelete(): boolean {
    return this.currentPermission === PermissionType.ADMIN;
  }

  canView(): boolean {
    return true; // כל המשתמשים יכולים לצפות
  }
}
