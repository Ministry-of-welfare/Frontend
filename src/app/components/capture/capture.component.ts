import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { CaptureService } from '../../services/capture/capture.service';
import { HttpClient } from '@angular/common/http';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ExportService } from '../../services/export/export.service';

export interface GroupImport {
  id: number;
  sourceDesc: string;
  system: string;
  fileName: string;
  importStartDate: string;
  endDate: string;
  totalRows: number;
  importedRows: number;
  errorRows: number;
  status: 'מוכן' | 'בתהליך' | 'הצלחה' | 'כישלון' | string;
}


@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule,FormsModule,    
],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent {
  constructor(private captureService: CaptureService,
              private importDataSource: ImportDataSourceService,
              private router: Router,
              private http: HttpClient,
              private exportService: ExportService) {}

  data2: any[] = [];
 @Input() totalItems: number = 0;          // סה"כ רשומות
  @Input() pageSize: number = 10;           // כמה רשומות לעמוד
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  // משתנים לתפריט קונטקסט
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuRow: any = null;
  ngOnInit(): void {
    //   ..נסיון שילוב
debugger;
//  שלב 1: מביאים את כל הקליטות
  this.captureService.getAll().subscribe(captures => {
    console.log("captures", captures); // בדיקה שהנתונים מגיעים
    // שלב 2: מביאים את כל המקורות
    this.importDataSource.getAll().subscribe(sources => {
          console.log("sources", sources); // בדיקה שהנתונים מגיעים
      // שלב 3: ממזגים נתונים
      this.data2 = captures.map(capture => {
        // מוצאים את המקור המתאים לפי importDataSourceId
        const source = sources.find(s => s.importDataSourceId === capture.importDataSourceId);
console.log("source", source); // בדיקה שהנתונים מגיעים
console.log("data2", this.data2); // בדיקה שהנתונים מגיעים
console.log("importStatusId", captures[0].importStatusId); // בדיקה שהנתונים מגיעים
        return {
          id: capture.importControlId,
          source: source ? source.importDataSourceDesc : '', // תיאור מקור מהטבלה השנייה
          // system:source ? source. : '', // או תביאי שם מערכת אם יש
          fileName: capture. fileName,
          importStartDate: capture.importStartDate,
          endDate: capture.importFinishDate??'-',
          total: capture.totalRows??'-',
          loaded: capture.totalRowsAffected??'-',
          failed: capture.rowsInvalid??'-',
          // status: capture.ImportStatus, // אם יש
          // statusLabel: capture.ImportStatusDesc // אם יש
        };
       });
     });
   });
}
  //עובד
  //  this.captureService.getAll().subscribe(data => {
  //      this.data2 = data;
  //      console.log(this.data2)
  //     console.log(this.data2[0].importControlId) // בדיקה שהנתונים מגיעים

  //    });}
     //נסיון המרה
//       this.importDataSource.getAll().subscribe(importSources => {
//         console.log(importSources); // בדיקה שהנתונים מגיעים
//   this.filterByImportDataSourceIds(importSources);
// });

//      this.captureService.getAll().subscribe(data => {
//     this.data2 = data.map(item => ({
//       id: item.ImportControlId,
//       source: item.ImportDataSourceId,
//       // system: item.importSystemDesc,
//       fileName: item.FileName,
//       importStartDate: item.ImportStartDate,
//       endDate: item.ImportFinishDate,
//       total: item.TotalRows,
//       loaded: item.TotalRowsAffected,
//       failed: item.RowsInvalid,
//       // status: item.importStatus,
//       // statusLabel: item.importStatusDesc
//     }));
//        console.log(this.data2)
//       console.log(this.data2[0].importControlId)
//   });

//   return this.data2;
//   }
  

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
    // ניווט לרכיב פרוט השורות ופתיחת הטאב של "שגיאות"
    this.router.navigate(['/view-control'], {
      state: {
        selectedTab: 'errors',
        captureId: this.contextMenuRow.id,
        captureName: this.contextMenuRow.source
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

    if (!row.failed || row.failed <= 0) {
      alert('אין שגיאות לייצא עבור פריט זה');
      return this.closeContextMenu();
    }

    const importControlId = row.id;
    // Request ViewControl (or any subscriber) to perform the export — fallbackToLocal = true
    this.exportService.requestExportErrors(importControlId, true);
    this.closeContextMenu();
  }
  openFilePath() {
    // פתיחת נתיב הקובץ לאחר עיבוד
    const row = this.contextMenuRow;
    if (!row) {
      alert('לא נבחרה שורה לפתיחה');
      return this.closeContextMenu();
    }

    const url = row.urlFileAfterProcess || row.url || null;
    if (!url) {
      alert('אין נתיב קובץ לאחר עיבוד עבור פריט זה');
      return this.closeContextMenu();
    }

    try {
      // אם זה כתובת http/https פשוט נפתח בלשונית חדשה
      if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank');
      } else if (/^file:\/\//i.test(url)) {
        // קישור מסוג file:// - נסה לפתוח ישירות (מדפדפן ייתכן שיחסום)
        window.open(url);
      } else {
        // מסלול יחס/מקומי - אם השרת משרת את הקבצים ניתן לנסות להוסיף base URL
        // נניח שהקבצים נגישים דרך '/files/' על השרת
        const maybeUrl = url.startsWith('/') ? url : '/files/' + url;
        window.open(maybeUrl, '_blank');
      }
    } catch (e) {
      console.error('שגיאה בניסיון לפתוח נתיב קובץ:', e);
      alert('לא ניתן לפתוח את נתיב הקובץ באופן אוטומטי. הנתיב: ' + url);
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

// ngOnInit(): void {
//   this.ImportControlService.getAll().subscribe(data => {
//       this.statuses= data.map(item => item.importStatusDesc)
//   .filter((t): t is string => t !== undefined);
//   console.log(data)
//     });}

//  capture = [
//     {
//       id: 1001,
//       source: 'קליטת עובדים סוציאליים',
//       system: 'מערכת עובדים',
//       fileName: 'social_workers_2024.xlsx',
//       importStartDate: '15.01.2025 09:30',
//       endDate: '15.01.2025 09:45',
//       total: 250,
//       loaded: 248,
//       failed: 0,
//       status: 'success',
//       statusLabel: 'הצלחה'
//     },]

  importStartDate = '';
  endDate = '';
  selectedSystem = '';
  selectedSource = '';
  selectedStatus = '';
  searchTerm = '';
  onlyErrors = false;

  // data = [
  //   {
  //     id: 1001,
  //     source: 'קליטת עובדים סוציאליים',
  //     system: 'מערכת עובדים',
  //     fileName: 'social_workers_2024.xlsx',
  //     importStartDate: '15.01.2025 09:30',
  //     endDate: '15.01.2025 09:45',
  //     total: 250,
  //     loaded: 248,
  //     failed: 0,
  //     status: 'success',
  //     statusLabel: 'הצלחה'
  //   },
  //   {
  //     id: 1002,
  //     source: 'קליטת משמרות',
  //     system: 'מערכת חירום',
  //     fileName: 'emergency_shifts.csv',
  //     importStartDate: '20.01.2025 14:15',
  //     endDate: '20.01.2025 14:20',
  //     total: 180,
  //     loaded: 180,
  //     failed: 0,
  //     status: 'success',
  //     statusLabel: 'הצלחה'
  //   },
  //   {
  //     id: 1003,
  //     source: 'קליטת בתי מלון',
  //     system: 'מערכת תיירות',
  //     fileName: 'hotels_data.xlsx',
  //     importStartDate: '05.02.2025 11:00',
  //     endDate: '-',
  //     total: 320,
  //     loaded: 15,
  //     failed: 0,
  //     status: 'in-progress',
  //     statusLabel: 'בתהליך'
  //   },
  //   {
  //     id: 1004,
  //     source: 'קליטת נתוני חירום',
  //     system: 'מערכת חירום',
  //     fileName: 'emergency_data_corrupt.csv',
  //     importStartDate: '10.12.2024 16:30',
  //     endDate: '10.12.2024 16:35',
  //     total: 450,
  //     loaded: 0,
  //     failed: 450,
  //     status: 'error',
  //     statusLabel: 'כישלון'
  //   }
  // ];



get filteredData() {
  console.log("data2", this.data2); // בדיקה שהנתונים מגיעים

  return this.data2.filter(item => {
    let ok = true;

    // טווח תאריכים
    if (this.importStartDate && item.importStartDate) {
      const itemStart = new Date(item.importStartDate.split(' ')[0].split('.').reverse().join('-'));
      const filterStart = new Date(this.importStartDate);
      if (itemStart < filterStart) ok = false;
    }

    if (this.endDate && item.endDate && item.endDate !== '-') {
      const itemEnd = new Date(item.endDate.split(' ')[0].split('.').reverse().join('-'));
      const filterEnd = new Date(this.endDate);
      if (itemEnd > filterEnd) ok = false;
      
    }

    // מערכת
    if (this.selectedSystem && item.system !== this.selectedSystem) ok = false;

    // מקור
    if (this.selectedSource && item.source !== this.selectedSource) ok = false;

    // סטטוס
    if (this.selectedStatus && item.status !== this.selectedStatus) ok = false;

    // שגיאות בלבד
    if (this.onlyErrors && item.failed <= 0) ok = false;

    // חיפוש טקסט
    if (this.searchTerm &&
        !item.fileName.includes(this.searchTerm) &&
        !item.source.includes(this.searchTerm)) {
      ok = false;
    }

    return ok;
  });
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

   applyFilters(): void {
    // קריאה מחדש ל־getter filteredData (שומר State)
    console.log('פילטרים הופעלו');
  }

  resetFilters(): void {
    this.importStartDate = '';
    this.endDate = '';
    this.selectedSystem = '';
    this.selectedSource = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.onlyErrors = false;
    console.log('הפילטרים אופסו');
  }


  pageSizeOptions: number[] = [5, 10, 20, 50];

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  changePage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  changePageSize(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  this.pageSizeChange.emit(+value); // ממיר ל-number
}

}



