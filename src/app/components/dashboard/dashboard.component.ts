import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  private refreshSubscription?: Subscription;
  
  // פילטרים
  filters = {
    fromDate: '',
    toDate: '',
    system: '',
    source: '',
    status: ''
  };
  
  // נתונים דמי מפורטים
  dummyFilters = {
    systems: [
      { id: 'crm', name: '🏢 מערכת CRM' },
      { id: 'erp', name: '📊 מערכת ERP' },
      { id: 'hr', name: '👥 מערכת HR' },
      { id: 'finance', name: '💰 מערכת כספים' }
    ],
    sources: [
      { id: 'api', name: '🔗 API חיצוני' },
      { id: 'file', name: '📁 קבצים' },
      { id: 'db', name: '🗄️ מסד נתונים' },
      { id: 'stream', name: '🌊 זרם נתונים' }
    ]
  };
  
  dummyData = {
    dailyStatus: {
      pending: 12,
      processing: 8,
      success: 156,
      failed: 3
    },
    kpis: {
      totalRuns: 179,
      successRate: 87.2,
      avgTime: '2.3 דק',
      medianTime: '1.8 דק',
      slaCompliance: 94.5
    },
    queue: [
      {
        sourceName: 'מערכת CRM - לקוחות',
        fileCount: 15,
        totalSize: '2.3 GB',
        eta: '10 דקות',
        slaWindow: '15 דקות',
        urgency: 'normal',
        slaStatus: 'ok',
        priority: 'medium',
        icon: '🏢'
      },
      {
        sourceName: 'API תשלומים חיצוני',
        fileCount: 8,
        totalSize: '890 MB',
        eta: '25 דקות',
        slaWindow: '20 דקות',
        urgency: 'urgent',
        slaStatus: 'risk',
        priority: 'high',
        icon: '💳'
      },
      {
        sourceName: 'מערכת HR - נוכחות',
        fileCount: 23,
        totalSize: '1.1 GB',
        eta: '8 דקות',
        slaWindow: '30 דקות',
        urgency: 'normal',
        slaStatus: 'ok',
        priority: 'low',
        icon: '👥'
      }
    ],
    topErrors: [
      {
        code: 'DB_CONNECTION_TIMEOUT',
        description: 'תם הזמן לחיבור למסד הנתונים',
        count: 12,
        affectedFields: ['customer_id', 'transaction_date'],
        trend: 'up',
        trendIcon: '📈',
        trendText: '+3 מהשעה'
      },
      {
        code: 'INVALID_FILE_FORMAT',
        description: 'פורמט קובץ לא תקין - CSV פגום',
        count: 8,
        affectedFields: ['email', 'phone_number'],
        trend: 'down',
        trendIcon: '📉',
        trendText: '-2 מהשעה'
      },
      {
        code: 'MEMORY_OVERFLOW',
        description: 'חריגה בזיכרון במהלך עיבוד',
        count: 5,
        affectedFields: ['large_text_field'],
        trend: 'stable',
        trendIcon: '➡️',
        trendText: 'יציב'
      }
    ],
    problematicSources: [
      {
        id: 'old_crm',
        name: 'מערכת לקוחות ישנה',
        failureRate: 15.2,
        avgTime: '8.5 דק',
        riskLevel: 'high',
        riskIcon: '🔴',
        issues: ['זמן איטי', 'שגיאות רבות']
      },
      {
        id: 'external_api',
        name: 'API ספק חיצוני',
        failureRate: 8.7,
        avgTime: '12.1 דק',
        riskLevel: 'medium',
        riskIcon: '🟡',
        issues: ['זמן חריג', 'סטיות נתונים']
      },
      {
        id: 'reports_system',
        name: 'מערכת דוחות פיננסיים',
        failureRate: 12.1,
        avgTime: '6.8 דק',
        riskLevel: 'medium',
        riskIcon: '🟠',
        issues: ['שגיאות ולידציה']
      }
    ],
    throughput: {
      files: 1247,
      records: 89653,
      dataVolume: '15.2 GB'
    },
    dataQuality: {
      overallScore: 87,
      corruptedRowsPercent: 0.3,
      corruptedRows: 267,
      totalRows: 89653,
      violationColumns: [
        { name: 'customer_email', violations: 45 },
        { name: 'phone_number', violations: 23 },
        { name: 'birth_date', violations: 12 }
      ],
      sourceQuality: [
        { sourceName: 'CRM', qualityScore: 92 },
        { sourceName: 'ERP', qualityScore: 88 },
        { sourceName: 'HR', qualityScore: 85 }
      ]
    },
    recentAlerts: [
      {
        time: '14:32',
        message: 'עומס גבוה במערכת CRM - זמן תגובה חורג',
        severity: 'high',
        severityText: 'גבוהה',
        sentTo: 'צוות תפעול',
        about: 'ביצועים',
        handlingStatus: 'active',
        handlingStatusText: 'בטיפול'
      },
      {
        time: '13:15',
        message: 'כשל זמני בחיבור למסד נתונים ראשי',
        severity: 'medium',
        severityText: 'בינונית',
        sentTo: 'מנהל מערכת',
        about: 'תשתית',
        handlingStatus: 'resolved',
        handlingStatusText: 'נפתר'
      },
      {
        time: '12:45',
        message: 'עדכון מערכת הושלם בהצלחה - כל השירותים פעילים',
        severity: 'low',
        severityText: 'נמוכה',
        sentTo: 'כל הצוות',
        about: 'עדכון מערכת',
        handlingStatus: 'completed',
        handlingStatusText: 'הושלם'
      }
    ]
  };

  constructor() {
    // אתחול תאריכים ברירת מחדל
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.filters.fromDate = yesterday.toISOString().split('T')[0];
    this.filters.toDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // רענון אוטומטי כל 30 שניות
    this.refreshSubscription = interval(30000).subscribe(() => {
      console.log('רענון אוטומטי של נתונים...');
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  onFiltersChange(): void {
    console.log('פילטרים השתנו:', this.filters);
    // כאן תוכל להוסיף לוגיקה לסינון הנתונים
  }

  clearFilters(): void {
    this.filters = {
      fromDate: '',
      toDate: '',
      system: '',
      source: '',
      status: ''
    };
    this.onFiltersChange();
  }

  onRefreshClick(): void {
    console.log('רענון ידני של הנתונים');
    // כאן תוכל להוסיף לוגיקה לרענון
  }

  onErrorClick(errorCode: string): void {
    console.log('פרטי שגיאה:', errorCode);
    // כאן תוכל להציג פופאפ או לנווט לעמוד פרטים
  }

  navigateToSource(sourceId: string): void {
    console.log('ניווט למקור:', sourceId);
    // כאן תוכל לנווט לעמוד פרטי המקור
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('he-IL');
  }

  getQualityScoreClass(): string {
    const score = this.dummyData.dataQuality.overallScore;
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    return 'poor';
  }
}