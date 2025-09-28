import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';

interface EmployeeRow {
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

@Component({
  selector: 'app-view-control',
  standalone: true,
  imports: [NgClass, NgFor, FormsModule],
  templateUrl: './view-control.component.html',
  styleUrls: ['./view-control.component.css'],
})
export class ViewControlComponent implements OnInit {
  rows: EmployeeRow[] = [];
  filteredRows: EmployeeRow[] = [];

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

  ngOnInit() {
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
    this.applyFilters();
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
    this.exportToExcel(this.filteredRows, 'עובדים-כללי');
  }

  exportErrorsToExcel(): void {
    const errorsOnly = this.filteredRows.filter(item => item.status === 'error');
    this.exportToExcel(errorsOnly, 'עובדים-שגיאות');
  }

  private exportToExcel(rows: EmployeeRow[], prefix: string): void {
    const headers = [
      'ID',
      'תעודת זהות',
      'שם פרטי',
      'שם משפחה',
      'אימייל',
      'טלפון',
      'מחלקה',
      'תפקיד',
      'תאריך התחלה',
      'סטטוס עובד',
      'סטטוס רשומה'
    ];

    const dataToExport = rows.map(item => [
      item.id,
      item.tz,
      item.firstName,
      item.lastName,
      item.email,
      item.phone,
      item.department,
      item.role,
      item.startDate,
      item.employeeStatus,
      item.status
    ]);

    const worksheetData = [headers, ...dataToExport];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true }
      };
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const now = new Date();
    const fileName = `${prefix}-${now.getFullYear()}${(now.getMonth()+1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}
