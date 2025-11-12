import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExportService } from '../../services/export/export.service';
import { RouterLink, Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { ImportControlService, ImportControlData, ImportError } from '../../services/import-control.service';

interface EmployeeRow {
  selected?: boolean;
  id: number;
  tz: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  startDate: string;
  employeeStatus: string;
  status: 'ok' | 'error';
  errors?: { field: string; message: string }[];
}

interface ErrorDetail {
    lineId: number; // מזהה השורה שאליה השגיאה שייכת

  columnName: string;
  errorType: string;
  receivedValue: string;
  requiredFormat: string;
  description: string;
}

@Component({
  selector: 'app-view-control',
  standalone: true,
  imports: [NgClass, NgFor, FormsModule, RouterLink, NgIf],
  templateUrl: './view-control.component.html',
  styleUrls: ['./view-control.component.css'],
})
export class ViewControlComponent implements OnInit {
  rows: EmployeeRow[] = [];
  filteredRows: EmployeeRow[] = [];
  captureId: number = 1001;
  captureName: string = 'קליטת עובדים סוציאליים';
  importControlId: number = 1001;
  allRows: EmployeeRow[] = [];
  errorDetails: ErrorDetail[] = [];
  summaryByError: any[] = [];
  stats: any = {};
consol: any;
  constructor(
    private router: Router, 
    private http: HttpClient, 
    private _exportService: ExportService,
    private importControlService: ImportControlService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.captureId = navigation.extras.state['captureId'] || this.captureId;
      this.captureName = navigation.extras.state['captureName'] || this.captureName;
      this.importControlId = navigation.extras.state['importControlId'] || this.captureId;
      // אם נשלח selectedTab דרך ה־state (למשל 'errors'), נעדכן את הטאב הנבחר
      if (navigation.extras.state['selectedTab']) {
        this.selectedTab = navigation.extras.state['selectedTab'];
      }
      // בדיקה האם יש בקשה לייצא אוטומטית שגיאות
      if (navigation.extras.state['autoExport']) {
        // נשמור את הסימן ונפעיל את הייצוא לאחר טעינת הנתונים ב-ngOnInit
        this._autoExportRequest = {
          captureId: this.captureId
        };
      }
    }
    this.exportService = _exportService;
  }

  // inject ExportService via property (will set in constructor below)
  exportService!: ExportService;

  private _autoExportRequest: { captureId?: number } | null = null;

  filters = {
    rowNumber: '',
    column: '',
    errorType: '',
    freeText: '',
    showErrorsOnly: false,
  };

  currentPage = 1;
  pageSize = 4;
  totalRecords = 0;
  totalPages = 0;
  startRecord = 0;
  endRecord = 0;
  selectedTab: string = 'all';

  ngOnInit() {
    this.loadData();
    // this.loadSummaryData();

    // subscribe to external export requests (e.g., from CaptureComponent)
    this.exportService.exportErrorsRequest.subscribe(req => {
      if (!req) return;
      // if request is for this capture (or captureId not set), proceed
      if (!req.captureId || req.captureId === this.captureId) {
        setTimeout(() => {
          this.selectedTab = 'errors';
          this.applyFilters();
          if (req.fallbackToLocal) {
            const serverErrors = this.filteredRows.filter(item => item.status === 'error');
            if (serverErrors && serverErrors.length > 0) {
              this.exportService.exportEmployeesToExcel(serverErrors, `קליטה_${this.captureId}_שגיאות`);
            } else {
              const localErrors = this.allRows.filter(r => r.status === 'error');
              if (localErrors && localErrors.length > 0) {
                this.exportService.exportEmployeesToExcel(localErrors, `קליטה_${this.captureId}_שגיאות_מקומי`);
              }
            }
          } else {
            this.exportErrorsToExcel();
          }
        }, 300);
      }
    });

  }
  loadSummaryData() {
    // במצב אמיתי: נתונים מהשרת
    const dataFromServer = null;

    if (dataFromServer) {
      // this.summaryByError = dataFromServer.summaryByError;
      // this.stats = dataFromServer.stats;
    } else {
      // נבנה מתוך הנתונים הקיימים בפועל
      const errorMap: { [key: string]: { count: number; columns: string[] } } = {};

      this.allRows.forEach(row => {
        row.errors?.forEach(err => {
          if (!errorMap[err.message]) {
            errorMap[err.message] = { count: 0, columns: [] };
          }
          errorMap[err.message].count++;
          if (!errorMap[err.message].columns.includes(err.field)) {
            errorMap[err.message].columns.push(err.field);
          }
        });
      });

      this.summaryByError = Object.entries(errorMap).map(([type, data]) => ({
        type,
        count: data.count,
        columns: data.columns
      }));

     this.stats = {
  totalRows: this.allRows.length,
  totalErrors: this.errorDetails.length,
  totalValidRows: this.allRows.filter(r => r.status === 'ok').length,
  totalErrorRows: this.allRows.filter(r => r.status === 'error').length,
  successRate: (
    (this.allRows.filter(r => r.status === 'ok').length / this.allRows.length) * 100
  ).toFixed(1),
  avgErrorsPerRow: (
    this.errorDetails.length / this.allRows.length
  ).toFixed(2)
};

    }
  }

  // Returns total rows count based on the currently loaded data (server or mock)
  get totalRowsCount(): number {
    return this.allRows ? this.allRows.length : 0;
  }

  // Returns number of rows that have status === 'error'
  get errorRowsCount(): number {
    return this.allRows ? this.allRows.filter(r => r.status === 'error').length : 0;
  }

  /**
   * 🟢 טעינת נתונים מהשרת (אם נכשל – מציג נתוני דמה)
   */
  loadData() {
    // שליפת נתוני הקליטה
    this.importControlService.getImportControlData(this.importControlId).subscribe({
      next: (controlData: ImportControlData) => {
        this.captureName = controlData.ImportDataSourceDesc;
        
        // שליפת שורות מטבלת BULK
        this.importControlService.getBulkTableRows(controlData.TableName, this.importControlId).subscribe({
          next: (bulkRows: any[]) => {
            // שליפת שגיאות
            this.importControlService.getImportErrors(this.importControlId).subscribe({
              next: (errors: ImportError[]) => {
                this.processDataWithErrors(bulkRows, errors);
                this.applyFilters();
                this.loadSummaryData();
                this.handleAutoExport();
              },
              error: () => this.fallbackToMockData()
            });
          },
          error: () => this.fallbackToMockData()
        });
      },
      error: () => this.fallbackToMockData()
    });
  }

  private processDataWithErrors(bulkRows: any[], errors: ImportError[]) {
    // מיפוי השגיאות לפי שורה
    const errorsByRow = new Map<number, ImportError[]>();
    errors.forEach(error => {
      if (!errorsByRow.has(error.ErrorRow)) {
        errorsByRow.set(error.ErrorRow, []);
      }
      errorsByRow.get(error.ErrorRow)!.push(error);
    });

    // עיבוד השורות עם סימון שגיאות
    this.rows = bulkRows.map(row => ({
      ...row,
      status: errorsByRow.has(row.id) ? 'error' : 'ok',
      errors: errorsByRow.get(row.id)?.map(err => ({
        field: err.ErrorColumn,
        message: err.ErrorDetail
      })) || []
    }));
    
    this.allRows = [...this.rows];
    this.errorDetails = errors.map(err => ({
      lineId: err.ErrorRow,
      columnName: err.ErrorColumn,
      errorType: err.ErrorDetail,
      receivedValue: err.ErrorValue,
      requiredFormat: 'פורמט נדרש',
      description: err.ErrorDetail
    }));
  }

  private fallbackToMockData() {
    console.warn('⚠️ לא הצלחנו לטעון נתונים מהשרת – מוצגים נתוני דמה.');
    this.loadMockData();
    this.applyFilters();
    this.loadSummaryData();
  }

  private handleAutoExport() {
    if (this._autoExportRequest) {
      setTimeout(() => {
        this.selectedTab = 'errors';
        this.applyFilters();
        this.exportErrorsToExcel();
      }, 200);
      this._autoExportRequest = null;
    }
  }

  /**
   * 🧩 נתוני דמה – יוצגו אם אין שרת פעיל
   */
  loadMockData() {
    this.rows = [
      {
        id: 1,
        tz: '123456789',
        firstName: 'משה',
        lastName: 'כהן',
        email: 'yosicoohen@example.com',
        phone: '053-1234567',
        department: 'שירותים חברתיים',
        role: 'עובד סוציאלי',
        startDate: '01-01-2024',
        employeeStatus: 'פעיל',
        status: 'ok',
      },
      {
        id: 2,
        tz: '987654321',
        firstName: 'יוסי',
        lastName: 'לוי',
        email: 'אימייל לא תקין',
        phone: '123',
        department: 'שירותים חברתיים',
        role: 'עובד סוציאלי',
        startDate: '01-02-2024',
        employeeStatus: 'פעיל',
        status: 'error',
        errors: [
          { field: 'phone', message: 'טלפון לא תקין' },
          { field: 'email', message: 'אימייל לא תקין' },
        ],
      },
      {
        id: 3,
        tz: '111222333',
        firstName: 'דנה',
        lastName: 'אברהם',
        email: 'dana.abraham@example.com',
        phone: '052-8765432',
        department: 'קליטה',
        role: 'מתמחה',
        startDate: '15-01-2024',
        employeeStatus: 'אינו פעיל',
        status: 'ok',
      },
      {
        id: 4,
        tz: '444555666',
        firstName: 'אורי',
        lastName: 'שמעוני',
        email: 'uri.shimoni@example.com',
        phone: '051-1122334',
        department: 'שירותי רווחה',
        role: 'יועץ מקצועי',
        startDate: '22-01-2024',
        employeeStatus: 'פעיל',
        status: 'ok',
      },
    ];

    this.errorDetails = [
      {
            lineId: 2,

        columnName: 'טלפון',
        errorType: 'טלפון לא תקין',
        receivedValue: '123',
        requiredFormat: 'מספר בעל 10 ספרות',
        description: 'הוזן מספר קצר מדי – נדרש פורמט 05X-XXXXXXX',
      },
      {
            lineId: 2,

        columnName: 'אימייל',
        errorType: 'אימייל לא תקין',
        receivedValue: 'אימייל לא תקין',
        requiredFormat: 'example@domain.com',
        description: 'המייל לא בפורמט תקין וכולל תווים לא חוקיים.',
      }
    ];

    this.allRows = [...this.rows];
    this.loadSummaryData();

  }
openErrorFromCell(row: any, column: string) {
  const mappedName = this.mapColumnKeyToHebrew(column).trim();

  const error = this.errorDetails.find(
    (e: any) =>
      e.columnName.trim() === mappedName &&
      e.lineId === row.id
  );

  if (error) {
    console.log('✅ נמצאה שגיאה:', error);
    this.selectedError = error;
    this.selectedErrorRow = row;
  } else {
    console.log('❌ אין שגיאה לשורה הזאת בעמודה הזאת');
    console.log('בדיקה:', { column, mappedName, allErrorColumns: this.errorDetails.map(e => e.columnName) });
  }
}
// מיפוי בין שמות העמודות במבנה לבין שמות בעברית
mapColumnKeyToHebrew(column: string): string {
  switch (column) {
    case 'phone': return 'טלפון';
    case 'email': return 'אימייל';
    case 'tz': return 'ת.ז';
    case 'firstName': return 'שם פרטי';
    case 'lastName': return 'שם משפחה';
    case 'department': return 'מחלקה';
    default: return column;
  }
}
getErrorsForRow(rowId: number) {
  return this.errorDetails.filter(e => e.lineId === rowId);
}
viewErrorDetails(errorSummary: any) {
  // כאן אתה יכול לפתוח פאנל צדדי או טאבל מודאלי
  // לדוגמה — תראה את כל השורות שמכילות את השגיאה הזאת
  this.selectedTab = 'errors'; // מעביר לטאב של השגיאות
  console.log('מציג פרטים לשגיאה:', errorSummary.type);
}
viewErrorColumns(errorSummary: any) {
  // מעביר אוטומטית לטאב של השגיאות
  this.selectedTab = 'errors';

  // מדפיס בקונסול כדי לבדוק שהכל עובד
  console.log('📊 מציג פרטים לעמודות בעייתיות:', errorSummary.columns);
}

  hasError(row: EmployeeRow, field: string) {
    return row.errors?.some((e) => e.field === field);
  }

  search() {
    this.currentPage = 1;
    this.applyFilters();
  }

  reset() {
    this.filters = {
      rowNumber: '',
      column: '',
      errorType: '',
      freeText: '',
      showErrorsOnly: false,
    };
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.rows];

    if (this.filters.rowNumber) {
      filtered = filtered.filter((row) =>
        row.id.toString().includes(this.filters.rowNumber)
      );
    }

    if (this.filters.column && this.filters.freeText) {
      filtered = filtered.filter((row) => {
        const value =
          (row as any)[this.filters.column]?.toString().toLowerCase() || '';
        return value.includes(this.filters.freeText.toLowerCase());
      });
    } else if (this.filters.freeText) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(this.filters.freeText.toLowerCase())
        )
      );
    }

    if (this.filters.errorType) {
      filtered = filtered.filter((row) =>
        row.errors?.some((e) => e.field === this.filters.errorType)
      );
    }

    if (this.filters.showErrorsOnly) {
      filtered = filtered.filter((row) => row.status === 'error');
    }

    this.totalRecords = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalRecords / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.filteredRows = filtered.slice(startIndex, endIndex);
    this.startRecord = this.totalRecords > 0 ? startIndex + 1 : 0;
    this.endRecord = Math.min(endIndex, this.totalRecords);
  }
  selectedError: ErrorDetail | null = null;
  selectedErrorRow: EmployeeRow | null = null;

getRowById(id: number): EmployeeRow | null {
  return this.allRows.find(r => r.id === id) || null;
}

 showErrorOverlay(error: ErrorDetail, row?: EmployeeRow) {
  // שמירת מיקום הגלילה הנוכחי
  sessionStorage.setItem('scrollPosition', window.scrollY.toString());

  this.selectedError = error;
  this.selectedErrorRow = row || this.getRowById(error.lineId);
}

 closeErrorOverlay() {
  // סוגר את הפאנל
  this.selectedError = null;
  this.selectedErrorRow = null;

  // ✅ מחכה רגע כדי לוודא שה־DOM עודכן לפני שמחזירים את הגלילה
  setTimeout(() => {
    const scrollY = sessionStorage.getItem('scrollPosition');
    if (scrollY) {
      window.scrollTo({ top: +scrollY, behavior: 'smooth' });
    }
  }, 100);
}


 viewErrorCatalog() {
  // סגור את הפאנל (אם פתוח)
  this.selectedError = null;
  this.selectedErrorRow = null;

  // עבור לטאב של "שורות שגויות"
  this.selectedTab = 'errors';

  // החזר את הגלילה למעלה
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


 exportSelectedToExcel(): void {
  const selectedRows = this.filteredRows.filter(row => row.selected);
  if (selectedRows.length === 0) {
    alert('לא נבחרו שורות לייצוא');
    return;
  }
  const mappedRows = this.mapRowsForExport(selectedRows);
  this.exportService.exportEmployeesToExcel(mappedRows, 'עובדים-מסומנים');
}


  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  getPages(): number[] {
    if (this.totalPages <= 1) return [1];

    const pages = [];
    const maxPages = 3;
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  exportAllToExcel(): void {
  const mappedRows = this.mapRowsForExport(this.filteredRows);
  this.exportService.exportEmployeesToExcel(mappedRows, 'עובדים-כללי');
}


  exportErrorsToExcel(): void {
  const errorsOnly = this.filteredRows.filter(item => item.status === 'error');
  const mappedRows = this.mapRowsForExport(errorsOnly);
  this.exportService.exportEmployeesToExcel(mappedRows, 'עובדים-שגיאות');
}
private mapRowsForExport(rows: EmployeeRow[]): any[] {
  return rows.map(row => ({
    ...row,
    status: row.status === 'error' ? 'שגיאה' : 'תקין'
  }));
}



}