import { Component } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule, EditProcessDialogComponent],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})export class FilesViewComponent {
  viewMode: 'cards' | 'table' = 'cards';
  processes = [
    {
      id: '1',
      name: 'קבוצת קליטת עובדים סוציאליים',
      schema: 'BULK_SOCIAL_WORKERS',
      system: 'משאבי אנוש',
      systemId: 'HR_SYSTEM',
      status: 'active',
      type: 'מערכת קליטה',
      created: '15.1.2025',
      updated: '1.9.2025',
      file: 'ImportSocialWorkersJob',
      urlFile: '/data/import/social.csv',
      urlFileAfter: '/data/processed/social.csv',
      errorRecipients: 'admin@company.com',
      endDate: '2025-12-31',
      startDate: '2025-01-01'
    },
    {
      id: '2',
      name: 'קליטת שעות מ-OkToGo',
      schema: 'BULK_HOURS_OKTOGO',
      system: 'מערכת נוכחות',
      systemId: 'HR_SYSTEM',
      status: 'active',
      type: 'מערכת נוכחות',
      created: '20.1.2025',
      updated: '2.9.2025',
      file: 'ImportOkToGoHoursJob',
      urlFile: '/data/import/hours.csv',
      urlFileAfter: '/data/processed/hours.csv',
      errorRecipients: 'hr@company.com',
      endDate: '2025-12-31',
      startDate: '2025-01-01'
    },
    {
      id: '3',
      name: 'קליטת ניהול סופרים',
      schema: 'BULK_PACKAGES_DATA',
      system: 'מערכת דוחות',
      systemId: 'FINANCE_SYSTEM',
      status: 'warning',
      type: 'מערכת דוחות',
      created: '5.2.2025',
      updated: '2.9.2025',
      file: 'ImportPackagesJob',
      urlFile: '/data/import/packages.csv',
      urlFileAfter: '/data/processed/packages.csv',
      errorRecipients: 'finance@company.com',
      endDate: '2025-12-31',
      startDate: '2025-01-01'
    },
    {
      id: '4',
      name: 'קליטת נתוני מלונות חירום',
      schema: 'BULK_EMERGENCY_HOTELS',
      system: 'מערכת דיור',
      systemId: 'CRM_SYSTEM',
      status: 'inactive',
      type: 'מערכת דיור',
      created: '30.8.2024',
      updated: '30.8.2025',
      file: 'ImportEmergencyHotelsJob',
      urlFile: '/data/import/hotels.csv',
      urlFileAfter: '/data/processed/hotels.csv',
      errorRecipients: 'admin@company.com',
      endDate: '2025-12-31',
      startDate: '2025-01-01'
    },
    {
      id: '5',
      name: 'קליטת נתוני תמיכה לעובדים סוציאליים',
      schema: 'BULK_SOCIAL_WORKERS_SUPPORT',
      system: 'משאבי אנוש',
      systemId: 'HR_SYSTEM',
      status: 'inactive',
      type: 'מערכת קליטה',
      created: '13.2.2025',
      updated: '15.7.2025',
      file: 'ImportSupportSocialWorkersJob',
      urlFile: '/data/import/support.csv',
      urlFileAfter: '/data/processed/support.csv',
      errorRecipients: 'support@company.com',
      endDate: '2025-12-31',
      startDate: '2025-01-01'
    }
  ];

  dialogVisible = false;
  dialogData: EditProcessData = {};
  dialogIsEdit = false;
  dialogIsView = false;

  setView(mode: 'cards' | 'table') {
    this.viewMode = mode;
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'active': return 'פעיל';
      case 'inactive': return 'לא פעיל';
      default: return status;
    }
  }

  openEditDialog(process: any) {
    this.dialogIsEdit = true;
    this.dialogIsView = false;
    this.dialogData = {
      dataSourceId: process.id || '',
      importDataSourceDesc: process.name || '',
      type: process.type || 'FILE_IMPORT',
      systemId: process.systemId || '',
      jobName: process.file || '',
      tableName: process.schema || '',
      urlFile: process.urlFile || '',
      urlFileAfterProcess: process.urlFileAfter || '',
      errorRecipients: process.errorRecipients || '',
      endDate: process.endDate || '',
      createdDate: process.created || '',
      startDate: process.startDate || ''
    };
    this.dialogVisible = true;
  }

  openViewDialog(process: any) {
    this.dialogIsEdit = false;
    this.dialogIsView = true;
    this.dialogData = {
      dataSourceId: process.id || '',
      importDataSourceDesc: process.name || '',
      type: process.type || 'FILE_IMPORT',
      systemId: process.systemId || '',
      jobName: process.file || '',
      tableName: process.schema || '',
      urlFile: process.urlFile || '',
      urlFileAfterProcess: process.urlFileAfter || '',
      errorRecipients: process.errorRecipients || '',
      endDate: process.endDate || '',
      createdDate: process.created || '',
      startDate: process.startDate || ''
    };
    this.dialogVisible = true;
  }

  onDialogConfirm(data: EditProcessData) {
    if (this.dialogIsEdit) {
      // עדכון תהליך קיים
      // כאן אפשר לעדכן את המערך processes בהתאם ל-id
    }
    this.dialogVisible = false;
  }

  onDialogCancel() {
    this.dialogVisible = false;
  }
}

