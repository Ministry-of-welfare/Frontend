import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>מערכת ניהול נתונים</h1>
        <p>ברוכים הבאים למערכת ניהול קבצים וסביבות</p>
      </div>
      
      <div class="cards-grid">
        <div class="feature-card" routerLink="/files">
          <div class="card-icon">📁</div>
          <h3>ניהול קבצים</h3>
          <p>צפייה, עריכה וניהול קבצי הנתונים</p>
        </div>
        
        <div class="feature-card" routerLink="/environments">
          <div class="card-icon">🌐</div>
          <h3>ניהול סביבות</h3>
          <p>הגדרת וניהול סביבות העבודה</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .hero-section {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .hero-section h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 16px;
    }
    
    .hero-section p {
      font-size: 1.2rem;
      color: #666;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }
    
    .feature-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .card-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      color: #333;
      margin-bottom: 12px;
      font-size: 1.4rem;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.5;
    }
  `]
})
export class HomePageComponent {}