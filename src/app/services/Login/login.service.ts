import { Injectable } from '@angular/core';

export enum PermissionType {
  VIEW_ONLY = 'VIEW_ONLY',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN'
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // משתנה הארד-קוד - יוחלף בעתיד בקריאה לשרת
  private currentPermission: PermissionType = PermissionType.VIEW_ONLY;

  constructor() { }

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
