import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // מערכת בחירה
  selectedItems: Set<string> = new Set();
  selectAll = false;

  // נתוני פאנל צד ימין
  liveStats = {
    processedToday: 127,
    activeJobs: 8,
    successRate: 94
  };

  pendingFiles = [
    { id: 'file1', name: 'קובץ לקוחות.csv', waitTime: '5 דק\'', position: 1, selected: false },
    { id: 'file2', name: 'נתוני מכירות.xlsx', waitTime: '12 דק\'', position: 2, selected: false },
    { id: 'file3', name: 'דוח חודשי.pdf', waitTime: '18 דק\'', position: 3, selected: false }
  ];

  topErrors = [
    { id: 'error1', type: 'שגיאת פורמט CSV', count: 15, selected: false },
    { id: 'error2', type: 'קובץ לא נמצא', count: 8, selected: false },
    { id: 'error3', type: 'שגיאת הרשאות', count: 5, selected: false }
  ];

  throughputStats = {
    currentRate: 45,
    dailyVolume: 2.3,
    avgProcessTime: 3.2
  };

  dataQuality = {
    completeness: 94,
    accuracy: 87,
    consistency: 91
  };

  recentAlerts = [
    { id: 'alert1', message: 'עומס גבוה במערכת', time: '09:34', severity: 'warning', recipient: 'admin@company.com', selected: false },
    { id: 'alert2', message: 'שגיאה בעיבוד קובץ', time: '08:58', severity: 'error', recipient: 'ops@company.com', selected: false },
    { id: 'alert3', message: 'עדכון מערכת הושלם', time: '07:40', severity: 'info', recipient: '', selected: false }
  ];

  // מחזיר את חמש ההתראות האחרונות — מסודר מהחדש לישן
  get lastFiveAlerts() {
    // הנחה: recentAlerts מסודר מהישן לחדש; כדי להציג מהחדש לישן והגבלת 5
    return [...this.recentAlerts].slice(-5).reverse();
  }

  problematicAreas = [
    { id: 'area1', location: 'שרת עיבוד #2', description: 'ביצועים איטיים', severity: 'medium', selected: false },
    { id: 'area2', location: 'מסד נתונים ראשי', description: 'שימוש גבוה בזיכרון', severity: 'high', selected: false },
    { id: 'area3', location: 'רשת פנימית', description: 'חיבור לא יציב', severity: 'low', selected: false }
  ];

  ngOnInit(): void {
    this.startLiveUpdates();
  }

  startLiveUpdates(): void {
    // עדכון נתונים כל 30 שניות
    setInterval(() => {
      this.updateLiveData();
    }, 30000);
  }

  updateLiveData(): void {
    // סימולציה של עדכון נתונים חיים
    this.liveStats.processedToday += Math.floor(Math.random() * 3);
    this.liveStats.activeJobs = Math.max(0, this.liveStats.activeJobs + Math.floor(Math.random() * 3) - 1);
    
    // עדכון תור קבצים
    this.pendingFiles.forEach(file => {
      const currentWait = parseInt(file.waitTime);
      if (currentWait > 1) {
        file.waitTime = (currentWait - 1) + ' דק\'';
      }
    });
    
    // עדכון throughput
    this.throughputStats.currentRate = 40 + Math.floor(Math.random() * 20);
    this.throughputStats.dailyVolume = Math.round((2 + Math.random() * 2) * 10) / 10;
  }

  refreshDashboard(): void {
    console.log('רענון דשבורד...');
    this.updateLiveData();
  }

  showErrorDetails(errorId: number): void {
    console.log(`הצגת פרטי שגיאה מספר: ${errorId}`);
    // כאן יוצג חלון עם דוגמאות ופירוט השגיאה
  }

  goToSource(sourceId: number): void {
    console.log(`מעבר למסך ניהול מקור מספר: ${sourceId}`);
    // כאן יתבצע ניווט למסך ניהול המקור
  }

  // פונקציות בחירה
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.selectedItems.clear();
    
    if (this.selectAll) {
      [...this.pendingFiles, ...this.topErrors, ...this.recentAlerts, ...this.problematicAreas]
        .forEach(item => {
          item.selected = true;
          this.selectedItems.add(item.id);
        });
    } else {
      [...this.pendingFiles, ...this.topErrors, ...this.recentAlerts, ...this.problematicAreas]
        .forEach(item => item.selected = false);
    }
  }

  toggleItemSelection(item: any): void {
    item.selected = !item.selected;
    
    if (item.selected) {
      this.selectedItems.add(item.id);
    } else {
      this.selectedItems.delete(item.id);
      this.selectAll = false;
    }
    
    // בדיקה אם כל הפריטים נבחרו
    const allItems = [...this.pendingFiles, ...this.topErrors, ...this.recentAlerts, ...this.problematicAreas];
    this.selectAll = allItems.every(i => i.selected);
  }

  getSelectedCount(): number {
    return this.selectedItems.size;
  }

  hasSelectedItems(): boolean {
    return this.selectedItems.size > 0;
  }

  // פעולות על פריטים נבחרים
  deleteSelected(): void {
    if (this.selectedItems.size === 0) {
      alert('לא נבחר אף פריט');
      return;
    }
    
    if (confirm(`האם אתה בטוח שברצונך למחוק ${this.selectedItems.size} פריטים?`)) {
      this.pendingFiles = this.pendingFiles.filter(item => !item.selected);
      this.topErrors = this.topErrors.filter(item => !item.selected);
      this.recentAlerts = this.recentAlerts.filter(item => !item.selected);
      this.problematicAreas = this.problematicAreas.filter(item => !item.selected);
      
      this.selectedItems.clear();
      this.selectAll = false;
    }
  }

  exportSelected(): void {
    if (this.selectedItems.size === 0) {
      alert('לא נבחר אף פריט');
      return;
    }
    
    console.log(`ייצוא ${this.selectedItems.size} פריטים נבחרים`);
    alert(`ייצוא ${this.selectedItems.size} פריטים הושלם`);
  }

  archiveSelected(): void {
    if (this.selectedItems.size === 0) {
      alert('לא נבחר אף פריט');
      return;
    }
    
    console.log(`העברה לארכיון של ${this.selectedItems.size} פריטים`);
    alert(`${this.selectedItems.size} פריטים הועברו לארכיון`);
  }

  clearSelection(): void {
    this.selectedItems.clear();
    this.selectAll = false;
    [...this.pendingFiles, ...this.topErrors, ...this.recentAlerts, ...this.problematicAreas]
      .forEach(item => item.selected = false);
  }
}