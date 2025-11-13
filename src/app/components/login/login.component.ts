import { Component } from '@angular/core';
import { LoginService } from '../../services/Login/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from "../../../../node_modules/@angular/router/index";

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

  constructor(private loginService: LoginService) {}

  testLogin() {
    this.message = 'מתחבר...';
    
    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.message = `הצלחה! טוקן: ${response.token}`;
        console.log('Login successful:', response);
      },
      error: (error) => {
        this.message = `שגיאה: ${error.message || error.status}`;
        console.error('Login failed:', error);
      }
    });
  }
}
