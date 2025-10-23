import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportControlService, ImportControl } from '../../services/import-control/import-control.service';

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

  // KPIs לממשק
  kpis = [
    { icon: '📈', value: '47', label: 'קליטות היום', change: '↗️ +12% מאתמול', changeType: 'positive', variant: 'primary' },
    { icon: '💯', value: '96.5%', label: 'אחוז הצלחה', change: '↗️ +2.3% השבוע', changeType: 'positive', variant: 'success' },
    { icon: '⚡', value: '4.2', label: 'זמן ממוצע (דקות)', change: '↘️ -8% מהממוצע', changeType: 'negative', variant: 'warning' },
    { icon: '📦', value: '2.4GB', label: 'נפח נתונים היום', change: '↗️ 245,891 רשומות', changeType: 'positive', variant: 'info' }
  ];

  systems = [
    { id: 1, name: 'כספות ראשית' },
    { id: 2, name: 'גיבוי' },
    { id: 3, name: 'דיווחים' }
  ];

  systemStats = [
    { name: 'כספות ראשית', count: 45, success: 98, color: '#667eea' },
    { name: 'משאבי אנוש', count: 35, success: 95, color: '#4caf50' },
    { name: 'דיווחים', count: 28, success: 92, color: '#ff9800' },
    { name: 'גיבוי', count: 19, success: 100, color: '#2196f3' }
  ];

  pendingFiles = [
    { id: 'file1', name: 'קובץ לקוחות.csv', waitTime: '5 דק\'', position: 1, selected: false },
    { id: 'file2', name: 'נתוני מכירות.xlsx', waitTime: '12 דק\'', position: 2, selected: false },
    { id: 'file3', name: 'דוח חודשי.pdf', waitTime: '18 דק\'', position: 3, selected: false }
  ];

  topErrors = [
    { id: 'error1', type: 'שגיאת פורמט CSV', count: 15, details: 'עמודה: שדהX | קובץ: data.csv', selected: false },
    { id: 'error2', type: 'קובץ לא נמצא', count: 8, details: 'מקור: SFTP', selected: false },
    { id: 'error3', type: 'שגיאת הרשאות', count: 5, details: 'משתמש: svc_import', selected: false }
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

  statuses = {
    waiting: 5,
    processing: 3,
    success: 47,
    error: 2
  };

  sla = {
    met: 89,
    missed: 11,
    avgDelay: 8,
    targetPercent: 95,
    targetMinutes: 10,
    trend: 'שיפור של 3% החודש'
  };
 dataQualityStats: {
    totalRows: number;
    totalInvalid: number;
    totalValid: number;
    successRate: number;
    statusCounts: Record<string, number>;
  } = {
    totalRows: 0,
    totalInvalid: 0,
    totalValid: 0,
    successRate: 0,
    statusCounts: {}
  };
  
  problematicFiles = [
    { name: 'קליטת עובדים סוציאליים - מחוז דרום', badgeText: '25% כישלון', badgeClass: 'badge-critical', note: 'זמן עיבוד: 15.2 דק׳' },
    { name: 'נתוני מפונים - עדכון שבועי', badgeText: '18% שגיאות', badgeClass: 'badge-warning', note: 'סטיית נפח: +45%' },
    { name: 'שעות OkToGo - קבצי פברואר', badgeText: '12% שגיאות', badgeClass: 'badge-warning', note: 'רשומות כפולות: 23' }
  ];

  liveFeed = [
    { time: '09:34', message: 'עומס גבוה במערכת', details: 'תור: 12 עבודות' },
    { time: '08:58', message: 'שגיאה בעיבוד קובץ', details: 'קובץ: נתוני לקוחות.csv' },
    { time: '07:40', message: 'עדכון מערכת הושלם', details: '' }
  ];

  quickActions = [
    { icon: '➕', title: 'הוספת קובץ', subtitle: 'העלה קובץ חדש', action: () => this.openAddFile() },
    { icon: '📁', title: 'ניהול מקורות', subtitle: 'ערוך מקורות קליטה', action: () => this.goToSource(0) }
  ];

  recentAlerts = [
    { id: 'alert1', message: 'עומס גבוה במערכת', time: '09:34', severity: 'warning', recipient: 'admin@company.com', selected: false },
    { id: 'alert2', message: 'שגיאה בעיבוד קובץ', time: '08:58', severity: 'error', recipient: 'ops@company.com', selected: false },
    { id: 'alert3', message: 'עדכון מערכת הושלם', time: '07:40', severity: 'info', recipient: '', selected: false }
  ];
constructor(private importControlService: ImportControlService) {}

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
      this.importControlService.getAll().subscribe(data => {
    console.log('קיבלתי מהשרת:', data);
    
    const totalRows = data.length;
    const totalInvalid = 0; // אם אין לך שדות שמחזיקים rowsInvalid, תשאיר 0 או תחשב
    const totalValid = totalRows - totalInvalid;
    const successRate = totalRows > 0 ? ((totalValid / totalRows) * 100) : 0;

    this.dataQualityStats = {
      totalRows,
      totalInvalid,
      totalValid,
      successRate,
      statusCounts: this.countStatuses(data)
    };
  });
  }
private countStatuses(data: ImportControl[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of data) {
    const status = item.importControlId || 'unknown'; // אם יש שדה status
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}
calcCircleDash(percent: number): string {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  return `${filled} ${circumference}`;
}

  onFromDate(event: any) {
    // implement date filtering if needed
    console.log('from date', event.target.value);
  }

  onToDate(event: any) {
    console.log('to date', event.target.value);
  }

  onSystemChange(event: any) {
    console.log('system changed', event.target.value);
  }

  onStatusChange(event: any) {
    console.log('status changed', event.target.value);
  }

  openAddFile() {
    console.log('open add file dialog');
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
        .forEach((item: any) => {
          (item as any).selected = true;
          this.selectedItems.add((item as any).id);
        });
    } else {
      [...this.pendingFiles, ...this.topErrors, ...this.recentAlerts, ...this.problematicAreas]
        .forEach((item: any) => (item as any).selected = false);
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
    this.selectAll = allItems.every((i: any) => (i as any).selected);
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
      this.pendingFiles = this.pendingFiles.filter((item: any) => !(item as any).selected);
      this.topErrors = this.topErrors.filter((item: any) => !(item as any).selected);
      this.recentAlerts = this.recentAlerts.filter((item: any) => !(item as any).selected);
      this.problematicAreas = this.problematicAreas.filter((item: any) => !(item as any).selected);
      
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
      .forEach((item: any) => (item as any).selected = false);
  }
}