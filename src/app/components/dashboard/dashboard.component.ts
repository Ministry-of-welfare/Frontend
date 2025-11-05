import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ImportControlService, ImportControl } from '../../services/import-control/import-control.service';
import { DashBoardService,DataQualityKpi,StatusCounts } from '../../services/DashBoard/dash-board.service';
import { SystemsService } from '../../services/systems/systems.service';
import { Systems } from '../../models/systems.model';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportStatusService } from '../../services/importStatus/import-status.service';
;import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    { provide: DashBoardService, useClass: DashBoardService },
    { provide: SystemsService, useClass: SystemsService }
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {
  
  // מערכת בחירה
  selectedItems: Set<string> = new Set();
  selectAll = false;

  // נתוני פאנל צד ימין
  liveStats = {
    processedToday: 127,
    activeJobs: 8,
    successRate: 94
  };

//  KPIs לממשק
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

  systemStats: any[] = [];
    private systemsSub?: Subscription;
  systemsList: Systems[] = [];

  
  // נתוני ביצועים לפי מערכת מהשרת
  systemPerformanceData: any[] = [];
  
  // צבעים למערכות בגרף
  systemColors = ['#667eea', '#4caf50', '#ff9800', '#2196f3', '#e91e63', '#9c27b0'];

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
    currentRate: 0,
    dailyVolume: 0.0,
    avgProcessTime: 0.0,
    successRateRaw: 0


  };

  // נפח נתונים מהשרת
  dataVolume: { totalRows: number; dataVolumeInGB: string } = { totalRows: 0, dataVolumeInGB: '' };
  dataVolumeLoading = false;
  dataVolumeError: string | null = null;

dataQuality: {
  ImportStatusId: number;
  ImportControlId: number;
  TotalRows: number;
  RowsInvalid: number;
  ValidRowsPercentage: number;
}[] = [];


  statuses = {
    waiting: 3,
    processing: 5,
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
dataQualityStats: any = {
  successRate: 0,
  totalValid: 0,
  totalInvalid: 0,
  totalRows: 0
};

  // KPI דינמי: קליטות היום
  todayImports: number | null = null;
  private importsSub?: Subscription;
  private avgTimeSub?: Subscription;
  private successRateSub?: Subscription;
  successRateRaw: any = null;

  
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
   systems$!: Observable<any[]>;
    sources$!: Observable<any[]>;
    statuses$!: Observable<any[]>;
  
    selectedSystemId: number | null = null;
    selectedSourceId: number | null = null;
    selectedStatusId: number | null = null;
  constructor(
    private dashboardService: DashBoardService,
    private systemsService: SystemsService,
    private sourcesService: ImportDataSourceService,
        private statusService: ImportStatusService
  ) {}

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
   statusCounts: StatusCounts | null = null;
  private statusCountsSub?: Subscription;

ngOnInit(): void {
  this.systems$ = this.systemsService.getAll();
  this.sources$ = this.sourcesService.getAll();
  this.statuses$ = this.statusService.getAll();



  this.systemsSub = this.systemsService.getAll().subscribe({
    next: (res) => this.systemsList = res || [],
    error: () => this.systemsList = []
  });

  this.startLiveUpdates();
  this.loadDashboardData();
}



  loadSystemPerformance(): void {
    this.systemsService.getSystemPerformance().subscribe({
      next: (data) => {
        console.log('System performance data received:', data);
        this.systemPerformanceData = data;
        
        // המרת הנתונים לפורמט הקיים
        this.systemStats = data.map((system, index) => ({
          name: system.systemName,
          count: system.totalFiles,
          success: system.successRate,
          color: this.systemColors[index % this.systemColors.length]
        }));
        
        console.log('Updated systemStats:', this.systemStats);
      },
      error: (err) => {
        console.error('שגיאה בטעינת נתוני ביצועים לפי מערכת:', err);
        // במקרה של שגיאה, נשתמש בנתונים ברירת מחדל
        this.systemStats = [
          { name: 'אין נתונים זמינים', count: 0, success: 0, color: '#cccccc' }
        ];
      }
    });
  }

  getTotalFiles(): number {
    return this.systemStats.reduce((total, system) => total + system.count, 0);
  }

  getCircleDashArray(count: number, index: number): string {
    const totalFiles = this.getTotalFiles();
    if (totalFiles === 0) return "0 440";
    
    const percentage = (count / totalFiles) * 100;
    const circumference = 2 * Math.PI * 70; // radius = 70
    const dashLength = (percentage / 100) * circumference;
    
    return `${dashLength} 440`;
  }

  getCircleDashOffset(index: number): string {
    const totalFiles = this.getTotalFiles();
    if (totalFiles === 0) return "0";
    
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const percentage = (this.systemStats[i].count / totalFiles) * 100;
      const circumference = 2 * Math.PI * 70;
      offset += (percentage / 100) * circumference;
    }
    
    return `-${offset}`;
  }

calcCircleDash(percent: number): string {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const filled = (percent / 100) * circumference;
  return `${filled} ${circumference}`;
}


  
  // loadTopErrors(): void {
  //   console.log('Loading top errors...');
  //   const searchParams = this.getSearchParams();
    
  //   this.dashboardService.getTopErrors(searchParams).subscribe({
  //     next: (data) => {
  //       console.log('Top errors data received:', data);
        
  //       if (data && Array.isArray(data) && data.length > 0) {
  //         this.topErrors = data.map((error: any) => ({
  //           id: `error${error.importErrorId}`,
  //           type: error.errorDetail,
  //           count: error.errorCount,
  //           details: `עמודה: ${error.errorColumn} | ערך: ${error.errorValue}`,
  //           selected: false
  //         }));
  //         console.log('Mapped topErrors:', this.topErrors);
  //       } else {
  //         console.warn('No errors data received');
  //         this.topErrors = [];
  //       }
  //     },
  //     error: (err) => {
  //       console.error('שגיאה בטעינת השגיאות הנפוצות:', err);
  //       // נתונים לדוגמה במקרה של שגיאה
  //       this.topErrors = [
  //         { id: 'error1', type: 'שגיאת פורמט CSV', count: 15, details: 'עמודה: שדהX | קובץ: data.csv', selected: false },
  //         { id: 'error2', type: 'קובץ לא נמצא', count: 8, details: 'מקור: SFTP', selected: false },
  //         { id: 'error3', type: 'שגיאת הרשאות', count: 5, details: 'משתמש: svc_import', selected: false }
  //       ];
  //     }
  //   });
  // }
loadTopErrors(params: any): void {
  console.log('Loading top errors...');
  this.dashboardService.getTopErrors(params).subscribe({
    next: (data) => {
      console.log('Top errors data received:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        this.topErrors = data.map((error: any) => ({
          id: `error${error.importErrorId}`,
          type: error.errorDetail,
          count: error.errorCount,
          details: `עמודה: ${error.errorColumn} | ערך: ${error.errorValue}`,
          selected: false
        }));
        console.log('Mapped topErrors:', this.topErrors);
      } else {
        console.warn('No errors data received');
        this.topErrors = [];
      }
    },
    error: (err) => {
      console.error('שגיאה בטעינת השגיאות הנפוצות:', err);
      // נתונים לדוגמה במקרה של שגיאה
      this.topErrors = [
        { id: 'error1', type: 'שגיאת פורמט CSV', count: 15, details: 'עמודה: שדהX | קובץ: data.csv', selected: false },
        { id: 'error2', type: 'קובץ לא נמצא', count: 8, details: 'מקור: SFTP', selected: false },
        { id: 'error3', type: 'שגיאת הרשאות', count: 5, details: 'משתמש: svc_import', selected: false }
      ];
    }
  });
}

  searchFilters = {
    fromDate: '',
    toDate: '',
    systemId: '',
    sourceId: '',
    status: ''
  };


  onFromDate(event: any) {
    this.searchFilters.fromDate = event.target.value;
    console.log('from date', event.target.value);
  }

  onToDate(event: any) {
    this.searchFilters.toDate = event.target.value;
    console.log('to date', event.target.value);
  }


 // ...existing code...
onSystemChange(eventOrValue: any) {
  // מקבל או את האירוע DOM או אובייקט/ערך ישירות
  const maybeEvent = eventOrValue && eventOrValue.target ? eventOrValue : null;
  let v: any = maybeEvent ? (maybeEvent.target as HTMLSelectElement).value : eventOrValue;

  // במקרה של [ngValue] v יכול להיות האובייקט עצמו
  if (v && typeof v === 'object') {
    this.selectedSystemId = v.systemId ?? v.systemId ?? null;
    this.searchFilters.systemId = String(this.selectedSystemId ?? '');
  } else {
    this.selectedSystemId = v ? Number(v) : null;
    this.searchFilters.systemId = v ?? '';
  }

  console.log('selected system id:', this.selectedSystemId);
}




  onSourceChange(eventOrValue: any) {
    const maybeEvent = eventOrValue && eventOrValue.target ? eventOrValue : null;
    let v: any = maybeEvent ? (maybeEvent.target as HTMLSelectElement).value : eventOrValue;
    
    console.log('source changed to:', v, 'type:', typeof v);
    // במקרה של [ngValue] v יכול להיות האובייקט עצמו
    if (v && typeof v === 'object') {
      this.selectedSourceId = v.importDataSourceId ?? null;
      this.searchFilters.sourceId = String(this.selectedSourceId ?? '');
    } else {
      this.selectedSourceId = (v && v !== '' && v !== 'undefined') ? Number(v) : null;
      this.searchFilters.sourceId = (v === 'undefined') ? '' : (v ?? '');
    }
    console.log('selected source id:', this.selectedSourceId);
    // // ngModel כבר מעדכן את searchFilters.sourceId אוטומטית
    // this.selectedSourceId = this.searchFilters.sourceId ? Number(this.searchFilters.sourceId) : null;
    // console.log('source changed to:', this.searchFilters.sourceId, 'searchFilters:', this.searchFilters);
  }



 
onStatusChange(event: Event) {
  const v = (event.target as HTMLSelectElement).value;

  // ✅ רק אם הערך הוא מספר תקין — נגדיר אותו
  this.selectedStatusId = v && !isNaN(Number(v)) ? Number(v) : null;

  console.log('selectedStatusId:', this.selectedStatusId);
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
  const params = this.getSearchParams(); // 🔁 זה מה שהיה חסר
  this.loadTopErrors(params);            // ⬅️ עכשיו זה יעבוד
  this.loadDashboardData();
  this.updateLiveData();
}





  private getSearchParams(): any {
    const params: any = {};
    
    if (this.searchFilters.fromDate && this.searchFilters.fromDate !== '') {
      params.fromDate = this.searchFilters.fromDate;
    }
    if (this.searchFilters.toDate && this.searchFilters.toDate !== '') {
      params.toDate = this.searchFilters.toDate;
    }
    if (this.searchFilters.systemId && this.searchFilters.systemId !== '') {
      params.systemId = this.searchFilters.systemId;
    }
    if (this.searchFilters.sourceId && this.searchFilters.sourceId !== '') {
      params.sourceId = this.searchFilters.sourceId;
    }
    if (this.searchFilters.status && this.searchFilters.status !== '') {
      params.status = this.searchFilters.status;
    }
    
    console.log('searchFilters:', this.searchFilters);
    console.log('getSearchParams returning:', params);
    return Object.keys(params).length > 0 ? params : null;

  if (this.selectedSourceId !== null && this.selectedSourceId !== undefined) {
    params.importDataSourceId = this.selectedSourceId;

  }
 return params;
}





loadDashboardData(): void {
  const params = this.getSearchParams();

  this.loadTopErrors(params); // ⬅️ מעביר את params במקום לקרוא שוב

  this.loadSystemPerformance();

  this.dashboardService.getDataQualityKpis(params).subscribe({
    next: (data) => {
      const totalRows = data.reduce((sum: number, kpi: DataQualityKpi) => sum + kpi.totalRows, 0);
      const totalInvalid = data.reduce((sum: number, kpi: DataQualityKpi) => sum + kpi.rowsInvalid, 0);
      const duplicateRecords = data.reduce((sum: number, kpi: DataQualityKpi) => sum + (kpi.duplicateRows || 0), 0);

      const totalValid = totalRows - totalInvalid;
      const successRate = totalRows === 0 ? 0 : Math.round((totalValid / totalRows) * 100);
      this.dataQualityStats = {
        totalRows,
        totalInvalid,
        totalValid,
        successRate,
        duplicateRecords
      };
    }
  });

  // build DataVolume params according to the API (use IDs for sources/status/system, strings for dates)
  const dvParams: any = {};
  if (this.selectedStatusId !== undefined && this.selectedStatusId !== null && Number.isFinite(this.selectedStatusId)) dvParams.importStatusId = this.selectedStatusId;
  if (this.selectedSourceId !== undefined && this.selectedSourceId !== null && Number.isFinite(this.selectedSourceId)) dvParams.importDataSourceId = this.selectedSourceId;
  if (this.selectedSystemId !== undefined && this.selectedSystemId !== null && Number.isFinite(this.selectedSystemId)) dvParams.systemId = this.selectedSystemId;
  if (this.searchFilters.fromDate) dvParams.importFromDate = this.searchFilters.fromDate;
  if (this.searchFilters.toDate) dvParams.importToDate = this.searchFilters.toDate;

  const dataVolumeParams = Object.keys(dvParams).length > 0 ? dvParams : null;
  console.log('DataVolume params ->', dataVolumeParams);

  this.dataVolumeLoading = true;
  this.dataVolumeError = null;
  this.dashboardService.getDataVolume(dataVolumeParams).subscribe({
    next: (res) => {
      this.dataVolume = res;
      this.dataVolumeLoading = false;
    },
    error: (err) => {
      console.error('Error loading DataVolume', err);
      this.dataVolumeError = err?.message || 'שגיאה בטעינת נפח נתונים';
      this.dataVolumeLoading = false;
    }
  });

  this.dashboardService.getImportsCount().subscribe({
    next: (count) => this.todayImports = count
  });

  this.dashboardService.getAvgProcessingTime(params).subscribe({
    next: (res: any) => {
      const avg = res?.averageMinutes ?? res;
      this.throughputStats.avgProcessTime = avg;
    }
  });

  this.dashboardService.getsuccessRate(params).subscribe({
    next: (res: any) => {
      const rate = res?.successRatePercent ?? res;
      this.throughputStats.successRateRaw = rate;
    }
  });

  this.dashboardService.getStatusCounts(params).subscribe({
    next: (res: StatusCounts) => this.statusCounts = res
  });
}

  showErrorDetails(errorId: String): void {

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

  exportSelected(): void {    if (this.selectedItems.size === 0) {
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

  ngOnDestroy(): void {
    // ניקה מנויים שנוצרו בקומפוננטה
    this.importsSub?.unsubscribe();
    this.avgTimeSub?.unsubscribe();
    this.successRateSub?.unsubscribe();
        this.statusCountsSub?.unsubscribe();

    // אם נוספו מנויים נוספים בעתיד, יש להוסיף כאן ביטול גם להם
  }
}