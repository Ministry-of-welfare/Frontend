import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ExportService } from '../../services/export/export.service';
import { CaptureService } from '../../services/capture/capture.service';
import { catchError, of } from 'rxjs';
import * as XLSX from 'xlsx';


interface TableRow {
  id: number;
  source: string;
  system: string;
  fileName: string;
  importStartDate?: string | null;
  endDate?: string | null;
  total: number;
  loaded: number;
  failed: number;
  status?: string;
  statusLabel?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent implements OnInit {
  // מקור נתונים: השרת מחזיר DTO/מוזג דרך search
  tableData: TableRow[] = [];

  // נתונים לאחר פילטרים מקומיים (לפאגינציה והצגה)
  allFilteredData: TableRow[] = [];
  filteredData: TableRow[] = [];

  // UI filters שנשלחים לשרת
  importStartDate = '';
  endDate = '';
  selectedSystem = '';
  selectedSource = '';
  selectedStatus = '';
  searchTerm = '';
  onlyErrors = false;

  // state
  loading = false;
  errorMsg = '';

  // pagination
  pageSizeOptions = [5, 10, 20, 50];
  pageSize = 10;
  currentPage = 1;

  // context menu
  // contextMenuVisible = false;
  // contextMenuX = 0;
  // contextMenuY = 0;
  // contextMenuRow: TableRow | null = null;
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuRow: any = null;

  constructor(
    private importDataSourceService: ImportDataSourceService,
    private router: Router,
    private exportService: ExportService
    , private captureService: CaptureService
  ) {}

  ngOnInit(): void {
    // התחלה: בקשת search עם פילטרים ריקים => השרת יחזיר את כל ה־DTO/מוזג
    this.searchImportDataSources();
    // קאש של נתיבי קבצים מתוך ה-ImportControl (urlFileAfterProcess)
    this.captureService.getAll().pipe(
      catchError(err => {
        console.warn('capture.getAll failed', err);
        return of([] as any[]);
      })
    ).subscribe((list: any[]) => {
      try {
        // בונה מפת id -> path
        this._filePathMap = {};
        for (const it of list || []) {
          const id = it.importControlId ?? it.id ?? null;
          const path = it.urlFileAfterProcess ?? it.urlFileAfterProcess ?? it.errorReportPath ?? null;
          if (id != null && path) this._filePathMap[id] = path;
        }
      } catch (e) {
        console.warn('failed mapping capture paths', e);
      }
    });
  }
  // map of importControlId -> urlFileAfterProcess
  private _filePathMap: Record<number, string> = {};

  // --- קריאה לשרת (רק search) ---
  searchImportDataSources(overrides?: any): void {
    this.loading = true;
    this.errorMsg = '';

    const filtersToSend: any = {
      status: this.selectedStatus || undefined,
      system: this.selectedSystem || undefined,
      search: this.searchTerm || undefined,
      importStartDate: this.importStartDate || undefined,
      importFinishDate: this.endDate || undefined,
      ...overrides
    };

    this.importDataSourceService.search(filtersToSend).pipe(
      catchError(err => {
        console.error('search error', err);
        this.errorMsg = 'שגיאה בטעינת נתונים';
        this.loading = false;
        return of([] as any[]);
      })
    ).subscribe((result: any[]) => {
      // Normalize לשדות שה־HTML מצפה להם
      this.tableData = (result || []).map(r => ({
        id: r.importControlId ?? r.id ?? 0,
        source: r.importDataSourceDesc ?? r.source ?? '',
        system: r.systemName ?? r.system ?? '',
        fileName: r.fileName ?? '',
        importStartDate: r.importStartDate ?? r.importStart ?? r.startDate ?? '',
        endDate: r.importFinishDate ?? r.importFinish ?? r.endDate ?? '',
        total: r.totalRows ?? r.total ?? 0,
        loaded: r.totalRowsAffected ?? r.loaded ?? 0,
        failed: r.rowsInvalid ?? r.failed ?? 0,
        status: r.importStatus ?? r.status ?? '',
        statusLabel: r.importStatusDesc ?? r.statusLabel ?? ''
      } as TableRow));

      // החלת פילטרים מקומיים (onlyErrors וכו') ועידכון פאגינציה
      this.currentPage = 1;
      this.applyLocalFiltersAndPaginate();
      this.loading = false;
    });
  }
 getStatusToken(item: any): string {
    const val = (item?.status || item?.statusLabel || '') + '';
    const parts = val.trim().split(/[ \t\-]+/);
    return parts.length ? parts[0] : '';
  }
  // --- פילטרים מקומיים + פאגינציה (slice) ---
  applyLocalFiltersAndPaginate(): void {
    this.allFilteredData = this.tableData.filter(item => {
      if (this.onlyErrors && !(item.failed && item.failed > 0)) return false;
      if (this.selectedSource && String(item.source) !== this.selectedSource) return false;
      if (this.selectedSystem && String(item.system) !== this.selectedSystem) return false;
      if (this.selectedStatus && String(item.status) !== this.selectedStatus) return false;
      if (this.searchTerm && !String(item.fileName).toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
   
      // תאריכים (אם רצוי להשוות - התאמה לפי פורמט התאריך שמגיע מהשרת)
      if (this.importStartDate && item.importStartDate) {
        const from = new Date(this.importStartDate);
        const itemDate = new Date(item.importStartDate);
        if (itemDate < from) return false;
      }
      if (this.endDate && item.endDate) {
        const to = new Date(this.endDate);
        const itemDate = new Date(item.endDate);
        if (itemDate > to) return false;
      }
  
      return true;
    
    });

    // pagination
    const total = this.allFilteredData.length;
    const maxPage = Math.max(1, Math.ceil(total / this.pageSize));
    this.currentPage = Math.min(Math.max(1, this.currentPage), maxPage);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredData = this.allFilteredData.slice(start, start + this.pageSize);
        this.computeStatusCounts();

  }

  // --- כפתורים / אירועים UI ---
  onSearchButtonClick(): void {
    // שולח את הפילטרים לשרת; השרת מחזיר DTO מוכן
    this.searchImportDataSources();
  }

  applyFilters(): void {
    // במקרה שמפעילים פילטרים מקומיים בלבד (כבר יש tableData) - עדכון תצוגה
    this.currentPage = 1;
    this.applyLocalFiltersAndPaginate();
  }

  resetFilters(): void {
    this.importStartDate = '';
    this.endDate = '';
    this.selectedSystem = '';
    this.selectedSource = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.onlyErrors = false;
    this.searchImportDataSources();
  }

  // --- pagination helpers (התבנית משתמשת ב־pages כ־property) ---
  get totalItems(): number { return this.allFilteredData.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }
  get startItem(): number { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get endItem(): number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  get pagesArray(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (this.currentPage > 3) pages.push('...');
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (this.currentPage < this.totalPages - 2) pages.push('...');
    pages.push(this.totalPages);
    return pages;
  }

  changePage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyLocalFiltersAndPaginate();
    }
  }

  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.applyLocalFiltersAndPaginate(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.applyLocalFiltersAndPaginate(); } }

  changePageSize(e: Event): void {
    const v = +(e.target as HTMLSelectElement).value;
    if (v > 0) {
      this.pageSize = v;
      this.currentPage = 1;
      this.applyLocalFiltersAndPaginate();
    }
  }

//   // --- context menu / row actions ---
//   onContextMenu(event: MouseEvent, row: TableRow): void {
//     event.preventDefault();
//     this.contextMenuVisible = true;
//     this.contextMenuX = event.clientX;
//     this.contextMenuY = event.clientY;
//     this.contextMenuRow = row;
//   }

//   onDocumentClick(_: MouseEvent): void {
//     this.contextMenuVisible = false;
//   }

//   viewDetails(): void { console.log('viewDetails', this.contextMenuRow); this.contextMenuVisible = false; }
//   viewRows(): void {
//     if (!this.contextMenuRow) return;
//     this.router.navigate(['/view-control'], { state: { captureId: this.contextMenuRow.id } });
//     this.contextMenuVisible = false;
//   }
//   viewErrors(): void { console.log('viewErrors', this.contextMenuRow); this.contextMenuVisible = false; }
//   downloadErrorReport(): void { console.log('downloadErrorReport', this.contextMenuRow); this.contextMenuVisible = false; }
//   openFilePath(): void { console.log('openFilePath', this.contextMenuRow); this.contextMenuVisible = false; }
//   showLogs(): void { console.log('showLogs', this.contextMenuRow); this.contextMenuVisible = false; }
//   onRowDoubleClick(row: TableRow): void { this.viewRows(); }

//  exportToExcel(): void {
//     // שמתי לוג בלבד — אם תרצי, אוסיף יצוא מלא כמו קודם
//     console.log('exportToExcel - total items', this.allFilteredData.length);
//   }



  //שני
 // פתיחת תפריט קונטקסט
  onContextMenu(event: MouseEvent, row: any) {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuRow = row;
  }

  // helper to map API row to the EmployeeRow shape expected by ExportService
  private mapApiRowToEmployeeRow(apiRow: any, seq: number, importControlId: number) {
    return {
      id: apiRow.id ?? apiRow.rowId ?? seq,
      tz: apiRow.tz ?? apiRow.identityNumber ?? apiRow.TZ ?? '',
      firstName: apiRow.firstName ?? apiRow.first_name ?? apiRow.NameFirst ?? '',
      lastName: apiRow.lastName ?? apiRow.last_name ?? apiRow.NameLast ?? '',
      email: apiRow.email ?? apiRow.Email ?? '',
      phone: apiRow.phone ?? apiRow.Phone ?? apiRow.Telephone ?? '',
      department: apiRow.department ?? apiRow.Department ?? apiRow.source ?? '',
      role: apiRow.role ?? apiRow.Role ?? '',
      startDate: apiRow.startDate ?? apiRow.importStartDate ?? '',
      employeeStatus: apiRow.employeeStatus ?? apiRow.statusDesc ?? '',
      status: (apiRow.status === 'error' || apiRow.hasError || apiRow.invalid) ? 'error' : 'ok',
      errors: apiRow.errors ?? apiRow.errorList ?? []
    };
  }

  // סגירת תפריט קונטקסט
  closeContextMenu() {
    this.contextMenuVisible = false;
    this.contextMenuRow = null;
  }

  // פעולות בתפריט
  viewDetails() {
    // צפייה בפרטי הקליטה
    alert('צפייה בפרטי הקליטה: ' + this.contextMenuRow.fileName);
    this.closeContextMenu();
  }
  viewRows() {
    // צפיה בפרוט שורות הקליטה
    this.router.navigate(['/view-control'], {
      state: {
        captureId: this.contextMenuRow.id,
        captureName: this.contextMenuRow.source
      }
    });
    this.closeContextMenu();
  }
  viewErrors() {
  this.router.navigate(['/view-control'], {
    state: {
      captureId: this.contextMenuRow.id,
      captureName: this.contextMenuRow.source,
      selectedTab: 'errors' // <<< עכשיו תואם ל-ViewControlComponent
    }
  });
  this.closeContextMenu();
}
  downloadErrorReport() {
    // הורדת דוח שגיאות
    const row = this.contextMenuRow;
    if (!row) {
      alert('לא נבחרה שורה');
      return this.closeContextMenu();
    }

    // אם הערך קיים ומצביע על 0 - אין שגיאות
    if (row.failed === 0) {
      alert('אין שגיאות לייצא עבור פריט זה');
      return this.closeContextMenu();
    }

    const importControlId = row.id;
    // הודעה למאזינים (אם יש כאלה פתוחים) לבצע ייצוא — עם fallback למקומי
    this.exportService.requestExportErrors(importControlId, true);

    // בנוסף, ננווט לעמוד ה־ViewControl עם בקשת autoExport: כך גם אם ה־ViewControl
    // לא היה פתוח בזמן הקריאה הוא ייטען ויבצע את הייצוא אוטומטית
    this.router.navigate(['/view-control'], {
      state: {
        captureId: importControlId,
        captureName: row.source,
        selectedTab: 'errors',
        autoExport: true
      }
    });

    this.closeContextMenu();
  }
  openFilePath() {
    const row = this.contextMenuRow;
    if (!row) {
      alert('לא נבחרה שורה');
      return this.closeContextMenu();
    }

    const importControlId = row.id ?? row.importControlId ?? null;
    // prefer map value, fallback to row fields
    let path: string | null = null;
    if (importControlId != null && this._filePathMap[importControlId]) {
      path = this._filePathMap[importControlId];
    }
    if (!path) {
      path = row.urlFileAfterProcess ?? row.urlFileAfterProcess ?? row.errorReportPath ?? null;
    }

    if (!path) {
      alert('אין נתיב קובץ זמין לפריט זה');
      return this.closeContextMenu();
    }

    // If a modern preload-exposed API is present, use it (recommended for Electron)
    try {
      const win = window as any;
      if (win && win.electronAPI && typeof win.electronAPI.openPath === 'function') {
        win.electronAPI.openPath(path).then((res: any) => {
          // res may contain ok/message depending on handler
          // optionally handle failure
          this.closeContextMenu();
        }).catch((err: any) => {
          console.warn('electronAPI.openPath failed', err);
          // fallthrough to older electron or browser fallback below
        });
        return;
      }

      // older renderer may expose electron via window.require
      const electron = (win && (win.require ? win.require('electron') : win.electron)) as any;
      if (electron && electron.shell) {
        if (/\\|\//.test(path)) {
          if (electron.shell.showItemInFolder) electron.shell.showItemInFolder(path);
          else if (electron.shell.openPath) electron.shell.openPath(path);
          else electron.shell.openExternal('file://' + path);
          this.closeContextMenu();
          return;
        }
      }
    } catch (e) {
      console.warn('electron handling failed', e);
    }

    // Browser fallback: try opening file:// URL (may be blocked by browser)
    try {
      const fileUrl = 'file:///' + path.replace(/\\/g, '/');
      console.warn('Attempting browser fallback open for', fileUrl);
      const newWin = window.open(fileUrl, '_blank');
      if (!newWin) {
        // likely blocked by popup blocker / not allowed to load local resource
        throw new Error('window.open blocked or failed');
      }
    } catch (e) {
      console.warn('failed to open file url', e);
      // Fallback: copy path to clipboard and tell the user to paste into Explorer
      try {
        if (navigator && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
          (navigator as any).clipboard.writeText(path).then(() => {
            alert('לא ניתן לפתוח אוטומטית. הנתיב הועתק ללוח. הדבק ב-Explorer כדי לגשת אליו:\n' + path);
          }).catch((clipErr: any) => {
            console.warn('clipboard write failed', clipErr);
            alert('לא ניתן לפתוח אוטומטית ואת ההעתקה ללוח נכשלה. הנתיב: ' + path);
          });
        } else {
          alert('לא ניתן לפתוח אוטומטית. העתק באופן ידני את הנתיב ופתח ב-Explorer:\n' + path);
        }
      } catch (clipEx) {
        console.warn('clipboard fallback failed', clipEx);
        alert('לא ניתן לפתוח את הנתיב במצב זה. נתיב: ' + path);
      }
    }

    this.closeContextMenu();
  }
  showLogs() {
    // הצגת לוגים
    alert('הצגת לוגים: ' + this.contextMenuRow.fileName);
    this.closeContextMenu();
  }

  // לחיצה כפולה על שורת אב
  onRowDoubleClick(row: any) {
    this.contextMenuRow = row;
    this.viewRows();
  }

  // סגירת תפריט בלחיצה מחוץ
  onDocumentClick(event: MouseEvent) {
    if (this.contextMenuVisible) {
      this.closeContextMenu();
    }
  }
  exportToExcel(): void {
    const headers = [
      'מ"ז קליטה',
      'תיאור מקור',
      'מערכת',
      'שם קובץ',
      'תחילת קליטה',
      'סיום קליטה',
      'שורות בקובץ',
      'שורות שנקלטו',
      'שורות פגומות',
      'סטטוס',
      'סטטוס בעברית'
    ];

    const dataToExport = this.filteredData.map(item => [
      item.id,
      item.source,
      item.system,
      item.fileName,
      item.importStartDate,
      item.endDate,
      item.total,
      item.loaded,
      item.failed,
      item.status,
      item.statusLabel
    ]);

  // הופך את כל השורות כדי ש-XLSX יכתוב אותן לפי סדר RTL
  const worksheetData = [headers, ...dataToExport].map(row => row.reverse());

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // ✅ מגדיר את כיווניות הגיליון מימין לשמאל
  (ws as any)['!sheetViews'] = [{ rightToLeft: true }];

  // ✅ יישור לימין והדגשת כותרות
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        alignment: { horizontal: 'right' },
        font: R === 0 ? { bold: true } : undefined
      };
    }
  }

  // יצירת workbook וכתיבה לקובץ
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'דו"ח קליטות');

  XLSX.writeFile(wb, 'דו"ח_קליטות_עברית.xlsx');
}
// ...existing code...
  // סטטיסטיקות לסטטוסים
  statusCounts = {
    waiting: 0,     // ממתין
    inProgress: 0,  // בתהליך
    success: 0,     // הצלחה
    error: 0,       // כישלון
    other: 0
  };

  private normalizeStatusToken(token: string): 'waiting'|'inProgress'|'success'|'error'|'other' {
    if (!token) return 'other';
    const t = token.trim().toLowerCase();
    if (t.startsWith('הצלחה') || t.startsWith('success')) return 'success';
    if (t.startsWith('כישלון') || t.startsWith('error') || t.startsWith('failed')) return 'error';
    if (t.startsWith('בתהליך') || t.includes('in-progress') || t.includes('in progress')) return 'inProgress';
    if (t.startsWith('ממתין') || t.startsWith('pending')) return 'waiting';
    return 'other';
  }

  // קראי לפונקציה הזו אחרי שמשנים/ממפים את הנתונים (למשל בסוף applyLocalFiltersAndPaginate או בסוף שגיאת ה־search)
  computeStatusCounts(): void {
    // אם רוצים שהסכום ישקף את התוצאות לאחר סינון מקומי - השתמשי ב־allFilteredData
    const list = Array.isArray(this.allFilteredData) ? this.allFilteredData : (Array.isArray(this.tableData) ? this.tableData : []);
    const counts = { waiting: 0, inProgress: 0, success: 0, error: 0, other: 0 };
    for (const item of list) {
      const token = this.getStatusToken ? this.getStatusToken(item) : ((item.statusLabel || item.status || '') + '');
      const key = this.normalizeStatusToken((token || '') + '');
      counts[key]++;
    }
    this.statusCounts = counts;
  }
// ...existing code...



}