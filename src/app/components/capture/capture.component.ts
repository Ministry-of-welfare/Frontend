import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
      failed: 2,
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
      const matchStatus =
        !this.selectedStatus || item.status === this.selectedStatus;
      const matchErrors = !this.onlyErrors || item.failed > 0;
      const matchSearch =
        !this.searchTerm ||
        item.fileName.includes(this.searchTerm) ||
        item.source.includes(this.searchTerm);
      return matchStatus && matchErrors && matchSearch;
    });
  }

//   exportToExcel(): void {
//   const element = document.getElementById('dataTable'); // ה-id של הטבלה שלך
//   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
//   const wb: XLSX.WorkBook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//   XLSX.writeFile(wb, 'table-data.xlsx');
// }
  exportToExcel(): void {
    const element = document.getElementById('dataTable');
    if (!element) return;
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'table-data.xlsx');
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
