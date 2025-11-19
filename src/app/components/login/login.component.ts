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
  username = '';
  password = '';
  message = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  testLogin() {
    if (!this.username || !this.password) {
      this.message = 'אנא מלא שם משתמש וסיסמה.';
      return;
    }
    
    this.message = 'מתחבר...';
    
    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.message = 'התחברות הצליחה! מעבר לדשבורד...';
        console.log('Login successful:', response);
        // ניתוב לדשבורד אחרי התחברות מוצלחת
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed - Full error:', error);
        
        // בדיקה אם יש שגיאה HTTP מקורית
        const originalError = error.originalError;
        if (originalError) {
          console.error('Original HTTP error:', originalError);
          console.error('HTTP status:', originalError.status);
          console.error('HTTP error body:', originalError.error);
          
          if (originalError.status === 401) {
            this.message = 'שם משתמש או סיסמה שגויים. אנא נסה שוב.';
          } else if (originalError.status === 404) {
            this.message = 'המשתמש לא רשום במערכת. אנא פנה למנהל.';
          } else if (originalError.status === 0) {
            this.message = 'לא ניתן להתחבר לשרת. אנא בדוק את החיבור.';
          } else {
            this.message = `אירעה שגיאה בהתחברות (קוד: ${originalError.status}). אנא נסה שוב.`;
          }
        } else {
          // אם אין שגיאה מקורית, השתמש בהודעה מהשירות
          this.message = error.message || 'אירעה שגיאה בהתחברות. אנא נסה שוב.';
        }
      }
    });
  }
}
