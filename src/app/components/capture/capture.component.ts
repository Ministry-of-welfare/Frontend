import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

export interface GroupImport {
  id: number;
  sourceDesc: string;
  system: string;
  fileName: string;
  startDate: string;
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

  constructor(private router: Router) {}
  // משתנים לתפריט קונטקסט
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextMenuRow: any = null;

  // פתיחת תפריט קונטקסט
  onContextMenu(event: MouseEvent, row: any) {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuRow = row;
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
    // צפיה בשגיאות
    alert('צפיה בשגיאות: ' + this.contextMenuRow.fileName);
    this.closeContextMenu();
  }
  downloadErrorReport() {
    // הורדת דוח שגיאות
    if (this.contextMenuRow.failed > 0) {
      alert('הורדת דוח שגיאות: ' + this.contextMenuRow.fileName);
    } else {
      alert('אין דוח שגיאות לשורה זו');
    }
    this.closeContextMenu();
  }
  openFilePath() {
    // פתיחת נתיב הקובץ לאחר עיבוד
    alert('פתיחת נתיב קובץ: ' + this.contextMenuRow.fileName);
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



  startDate = '';
  endDate = '';
  selectedSystem = '';
  selectedSource = '';
  selectedStatus = '';
  searchTerm = '';
  onlyErrors = false;

  data = [
    {
      id: 1001,
      source: 'קליטת עובדים סוציאליים',
      system: 'מערכת עובדים',
      fileName: 'social_workers_2024.xlsx',
      startDate: '15.01.2025 09:30',
      endDate: '15.01.2025 09:45',
      total: 250,
      loaded: 248,
      failed: 0,
      status: 'success',
      statusLabel: 'הצלחה'
    },
    {
      id: 1002,
      source: 'קליטת משמרות',
      system: 'מערכת חירום',
      fileName: 'emergency_shifts.csv',
      startDate: '20.01.2025 14:15',
      endDate: '20.01.2025 14:20',
      total: 180,
      loaded: 180,
      failed: 0,
      status: 'success',
      statusLabel: 'הצלחה'
    },
    {
      id: 1003,
      source: 'קליטת בתי מלון',
      system: 'מערכת תיירות',
      fileName: 'hotels_data.xlsx',
      startDate: '05.02.2025 11:00',
      endDate: '-',
      total: 320,
      loaded: 15,
      failed: 0,
      status: 'in-progress',
      statusLabel: 'בתהליך'
    },
    {
      id: 1004,
      source: 'קליטת נתוני חירום',
      system: 'מערכת חירום',
      fileName: 'emergency_data_corrupt.csv',
      startDate: '10.12.2024 16:30',
      endDate: '10.12.2024 16:35',
      total: 450,
      loaded: 0,
      failed: 450,
      status: 'error',
      statusLabel: 'כישלון'
    }
  ];
get filteredData() {
  return this.data.filter(item => {
    let ok = true;

    // טווח תאריכים
    if (this.startDate && item.startDate) {
      const itemStart = new Date(item.startDate.split(' ')[0].split('.').reverse().join('-'));
      const filterStart = new Date(this.startDate);
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

  // get filteredData() {
  //   return this.data.filter(item => {
  //     const matchStatus =
  //       !this.selectedStatus || item.status === this.selectedStatus;
  //     const matchErrors = !this.onlyErrors || item.failed > 0;
  //     const matchSearch =
  //       !this.searchTerm ||
  //       item.fileName.includes(this.searchTerm) ||
  //       item.source.includes(this.searchTerm);
  //     return matchStatus && matchErrors && matchSearch;
  //   });


    
  // }

//   exportToExcel(): void {
//   const element = document.getElementById('dataTable'); // ה-id של הטבלה שלך
//   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//   XLSX.writeFile(wb, 'table-data.xlsx');
// }
  /**
   * הפונקציה תמשיך לעבוד גם עם נתונים אמיתיים מהשרת,
   * כל עוד הנתונים נשמרים במשתנה data והפונקציה filteredData מחזירה את השורות הרלוונטיות.
   */
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
    // 'סטטוס בעברית'
  ];

  // הפיכת הסדר של הנתונים – כך שהעמודה הימנית תהיה הראשונה בגיליון
  const dataToExport = this.filteredData.map(item => [
    item.id,
    item.source,
    item.system,
    item.fileName,
    item.startDate,
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
    this.startDate = '';
    this.endDate = '';
    this.selectedSystem = '';
    this.selectedSource = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.onlyErrors = false;
    console.log('הפילטרים אופסו');
  }
}





// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import * as XLSX from 'xlsx';

// import { CaptureService } from '../../services/capture/capture.service';
// import { ImportControl } from '../../models/importControl.model';

// @Component({
//   selector: 'app-capture',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './capture.component.html',
//   styleUrl: './capture.component.css'
// })
// export class CaptureComponent implements OnInit {

//   startDate = '';
//   endDate = '';
//   selectedStatus = '';
//   searchTerm = '';
//   onlyErrors = false;

//   data: ImportControl[] = [];

//   constructor(private captureService: CaptureService) {}

//   ngOnInit(): void {
//     this.captureService.getAll().subscribe({
//       next: (res: ImportControl[]) => {
//         this.data = res;
//         console.log('Data from API:', res);
//       },
//       error: (err) => {
//         console.error('Error while fetching data:', err);
//       }
//     });
//   }

//   get filteredData(): ImportControl[] {
//     return this.data.filter(item => {
//       const matchErrors = !this.onlyErrors || (item.RowsInvalid ?? 0) > 0;
//       const matchSearch =
//         !this.searchTerm ||
//         (item.FileName?.includes(this.searchTerm) ?? false) ||
//         (item.ErrorReportPath?.includes(this.searchTerm) ?? false);
//       // שים לב: במודל שלך אין "סטטוס" מובהק, אז סינון סטטוס הוסר או יצטרך להגיע מהשרת
//       return matchErrors && matchSearch;
//     });
//   }

//   exportToExcel(): void {
//     const element = document.getElementById('dataTable');
//     if (!element) return;
//     const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, 'table-data.xlsx');
//   }
// }
