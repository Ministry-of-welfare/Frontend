import { Component } from '@angular/core';
import { LoginService } from '../../services/Login/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = 'testuser';
  password = 'testpass';
  message = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  testLogin() {
    this.message = 'מתחבר...';
    
    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.message = 'התחברות הצליחה! מעבר לדשבורד...';
        console.log('Login successful:', response);
        // ניתוב לדשבורד אחרי התחברות מוצלחת
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.message = `שגיאה: ${error.message || error.status}`;
        console.error('Login failed:', error);
      }
    });
  }
}
