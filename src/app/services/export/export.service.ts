import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor() {}

  // Subject to request that a ViewControl (or other listener) export errors for a capture
  exportErrorsRequest: Subject<{ captureId: number; fallbackToLocal?: boolean }> = new Subject();
  // keep last pending request so late subscribers can pick it up once
  pendingExportRequest: { captureId: number; fallbackToLocal?: boolean } | null = null;

  requestExportErrors(captureId: number, fallbackToLocal = false) {
    const req = { captureId, fallbackToLocal };
    this.pendingExportRequest = req;
    this.exportErrorsRequest.next(req);
  }

  exportEmployeesToExcel(rows: any[], prefix: string) {
    if (!rows || rows.length === 0) {
      alert('לא נמצאו רשומות לייצוא');
      return;
    }

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

    const reversedHeaders = [...headers].reverse();

    const dataToExport = rows.map(item =>
      [
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
      ].reverse()
    );

    const worksheetData = [reversedHeaders, ...dataToExport];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    (ws as any)['!sheetViews'] = [
      { rightToLeft: true, zoomScale: 110 }
    ];

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

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'דוח עובדים');

    const now = new Date();
    const fileName = `${prefix}-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
        .getHours()
        .toString()
        .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
          .getSeconds()
          .toString()
          .padStart(2, '0')}.xlsx`;

    XLSX.writeFile(wb, fileName, { compression: true });
  }

  // Generic export: export array of objects (JSON) preserving their keys as columns
  exportJsonToExcel(items: any[], prefix: string) {
    if (!items || items.length === 0) {
      alert('לא נמצאו רשומות לייצוא');
      return;
    }

    // derive headers from keys of first object (preserve order)
    const first = items[0];
    const headers = Object.keys(first);

    // build rows array: headers then values
    const data = items.map(it => headers.map(h => it[h] ?? ''));
    const worksheetData = [headers, ...data].map(row => row.slice().reverse());

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    (ws as any)['!sheetViews'] = [{ rightToLeft: true }];

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

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'דוח שגיאות');

    const now = new Date();
    const fileName = `${prefix}-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
        .getHours()
        .toString()
        .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
          .getSeconds()
          .toString()
          .padStart(2, '0')}.xlsx`;

    XLSX.writeFile(wb, fileName, { compression: true });
  }
}
