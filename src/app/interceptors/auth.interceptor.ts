import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { LoginService } from '../services/Login/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private loginService: LoginService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.loginService.getToken();
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}