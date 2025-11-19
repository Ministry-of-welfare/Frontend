import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export enum PermissionType {
  VIEW_ONLY = 'ViewOnly',
  EDIT = 'Edit',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'SuperAdmin',
  MANAGER = 'Manager'
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly API_URL = 'https://localhost:54525/TabUser';
  // הוסר הארד-קוד - ההרשאות יגיעו מהטוקן
  private token: string | null = null;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { userName: username, password }).pipe(
      tap(response => {
        if (response.token) {
          this.token = response.token;
          localStorage.setItem('authToken', response.token);
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError(error => {
        let errorMessage = 'שגיאה בהתחברות';
        
        if (error.status === 401) {
          errorMessage = 'שם משתמש או סיסמה שגויים';
        } else if (error.status === 404) {
          errorMessage = 'משתמש לא קיים במערכת';
        } else if (error.status === 0) {
          errorMessage = 'בעיית תקשורת עם השרת';
        }
        
        return throwError(() => ({ message: errorMessage, originalError: error }));
      })
    );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    // ההרשאות יגיעו מהטוקן
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
      // ההרשאות יגיעו מהטוקן
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
  loginUser(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      this.login(username, password).subscribe({
        next: () => resolve({ success: true }),
        error: (err) => resolve({ success: false, message: err.message })
      });
    });
  }

  getCurrentPermission(): PermissionType {
    return this.getPermissionFromToken();
  }

  private getPermissionFromToken(): PermissionType {
    if (!this.token) return PermissionType.VIEW_ONLY;
    
    try {
      const decoded: any = jwtDecode(this.token);
      console.log('Decoded token:', decoded); // לבדיקה
      
      // בדיקה של השדה permission
      if (decoded.permission) {
        switch (decoded.permission.toLowerCase()) {
          case 'superadmin': return PermissionType.SUPER_ADMIN;
          case 'admin': return PermissionType.ADMIN;
          case 'manager': return PermissionType.MANAGER;
          case 'edit': return PermissionType.EDIT;
          case 'viewonly': return PermissionType.VIEW_ONLY;
          default: return PermissionType.VIEW_ONLY;
        }
      }
      
      // בדיקה של השדה role (אם permission לא קיים)
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (role) {
        switch (role.toLowerCase()) {
          case 'superadmin': return PermissionType.SUPER_ADMIN;
          case 'admin': return PermissionType.ADMIN;
          case 'manager': return PermissionType.MANAGER;
          case 'editor': return PermissionType.EDIT;
          case 'viewer': return PermissionType.VIEW_ONLY;
          default: return PermissionType.VIEW_ONLY;
        }
      }
      
      return PermissionType.VIEW_ONLY;
    } catch (error) {
      console.error('Error decoding token:', error);
      return PermissionType.VIEW_ONLY;
    }
  }

  canEdit(): boolean {
    const permission = this.getCurrentPermission();
    return permission === PermissionType.EDIT || 
           permission === PermissionType.MANAGER ||
           permission === PermissionType.ADMIN || 
           permission === PermissionType.SUPER_ADMIN;
  }

  canDelete(): boolean {
    const permission = this.getCurrentPermission();
    return permission === PermissionType.ADMIN || 
           permission === PermissionType.SUPER_ADMIN;
  }

  canManage(): boolean {
    const permission = this.getCurrentPermission();
    return permission === PermissionType.MANAGER ||
           permission === PermissionType.ADMIN || 
           permission === PermissionType.SUPER_ADMIN;
  }

  isSuperAdmin(): boolean {
    return this.getCurrentPermission() === PermissionType.SUPER_ADMIN;
  }

  canView(): boolean {
    return true; // כל המשתמשים יכולים לצפות
  }
}
