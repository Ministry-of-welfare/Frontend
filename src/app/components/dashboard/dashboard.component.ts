import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private refreshSubscription?: Subscription;

  constructor() {}

  ngOnInit(): void {
    // רענון אוטומטי כל 30 שניות
    this.refreshSubscription = interval(30000).subscribe(() => {
      console.log('רענון אוטומטי של נתונים...');
      this.simulateLiveData();
    });

    // סימולציה של נתונים חיים כל 10 שניות
    setInterval(() => this.simulateLiveData(), 10000);

    // אנימציית טעינה ראשונית
    setTimeout(() => {
      this.initializeCards();
    }, 100);

    // הוספת אפקט Ripple לכפתורים
    this.addRippleEffect();

    // הוספת CSS לאנימציית Ripple
    this.addRippleCSS();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refreshDashboard(): void {
    const btn = document.querySelector('.refresh-btn') as HTMLElement;
    if (btn) {
      btn.style.background = 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)';
      btn.innerHTML = '⏳ מרענן...';
      
      setTimeout(() => {
        btn.style.background = 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
        btn.innerHTML = '✅ עודכן';
        
        setTimeout(() => {
          btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          btn.innerHTML = '🔄 רענן';
        }, 2000);
      }, 1500);
      
      console.log('רענון דשבורד...');
    }
  }

  showErrorDetails(errorId: number): void {
    const errorItems = document.querySelectorAll('.error-item');
    errorItems.forEach(item => {
      (item as HTMLElement).style.transform = 'scale(0.95)';
      (item as HTMLElement).style.opacity = '0.7';
    });
    
    setTimeout(() => {
      errorItems.forEach(item => {
        (item as HTMLElement).style.transform = 'scale(1)';
        (item as HTMLElement).style.opacity = '1';
      });
      alert(`הצגת פרטי שגיאה מספר: ${errorId}\nכאן יוצג חלון עם דוגמאות ופירוט השגיאה`);
    }, 200);
  }

  goToSource(sourceId: number): void {
    const sourceItems = document.querySelectorAll('.source-item');
    sourceItems.forEach(item => {
      (item as HTMLElement).style.transform = 'translateX(-10px)';
      (item as HTMLElement).style.opacity = '0.7';
    });
    
    setTimeout(() => {
      sourceItems.forEach(item => {
        (item as HTMLElement).style.transform = 'translateX(0)';
        (item as HTMLElement).style.opacity = '1';
      });
      alert(`מעבר למסך ניהול מקור מספר: ${sourceId}`);
    }, 200);
  }

  private simulateLiveData(): void {
    const statusNumbers = document.querySelectorAll('.status-number');
    statusNumbers.forEach(element => {
      const currentValue = parseInt(element.textContent || '0');
      const newValue = currentValue + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0);
      
      if (newValue >= 0) {
        (element as HTMLElement).style.transform = 'scale(1.2)';
        (element as HTMLElement).style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          element.textContent = newValue.toString();
          (element as HTMLElement).style.transform = 'scale(1)';
        }, 150);
      }
    });
    
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(element => {
      (element as HTMLElement).style.transform = 'translateY(-2px)';
      setTimeout(() => {
        (element as HTMLElement).style.transform = 'translateY(0)';
      }, 300);
    });
  }

  private initializeCards(): void {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        (card as HTMLElement).style.transition = 'all 0.6s ease';
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  private addRippleEffect(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('.error-item, .source-item, .queue-item, .refresh-btn')) {
        this.createRippleEffect(e);
      }
    });
  }

  private createRippleEffect(event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(102, 126, 234, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = (event.clientX - rect.left - 10) + 'px';
    ripple.style.top = (event.clientY - rect.top - 10) + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  private addRippleCSS(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}