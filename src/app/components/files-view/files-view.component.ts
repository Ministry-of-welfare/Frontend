import { Component } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule, EditProcessDialogComponent],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})

export class FilesViewComponent {
  viewMode: 'cards' | 'table' = 'cards';
  processes: any[] = [];

  constructor(private importDS: ImportDataSourceService) {}

  ngOnInit(): void {
    this.importDS.getAll().subscribe({
      next: (data) => {
        this.processes = data;
        console.log('importDS נתונים מהשרת:', data);
      },
      error: (err) => {
        console.error('importDS שגיאה בקבלת נתונים', err);
      }
    });
  }

  dialogVisible = false;
  dialogData: EditProcessData = {};
  dialogIsEdit = false;
  dialogIsView = false;
  deleteDialogVisible = false;
  selectedProcessToDelete: any = null;

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

  openDeleteDialog(process: any) {
    this.selectedProcessToDelete = process;
    this.deleteDialogVisible = true;
  }

  closeDeleteDialog() {
    this.deleteDialogVisible = false;
    this.selectedProcessToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedProcessToDelete) return;
    // Build the object with correct field names for the server
    const updated = {
      importDataSourceId: this.selectedProcessToDelete.importDataSourceId,
      importDataSourceDesc: this.selectedProcessToDelete.importDataSourceDesc,
      dataSourceTypeId: this.selectedProcessToDelete.dataSourceTypeId,
      systemId: this.selectedProcessToDelete.systemId,
      jobName: this.selectedProcessToDelete.jobName,
      tableName: this.selectedProcessToDelete.tableName,
      urlFile: this.selectedProcessToDelete.urlFile,
      urlFileAfterProcess: this.selectedProcessToDelete.urlFileAfterProcess,
      endDate: this.selectedProcessToDelete.endDate,
      errorRecipients: this.selectedProcessToDelete.errorRecipients,
      insertDate: this.selectedProcessToDelete.insertDate,
      startDate: this.selectedProcessToDelete.startDate,
      status: 'inactive'
      // הוסף שדות נוספים אם נדרשים ע"י השרת
    };
    this.importDS.updateImportDataSource(updated.importDataSourceId, updated).subscribe({
      next: () => {
        // רענון מהשרת
        this.importDS.getAll().subscribe({
          next: (data) => {
            this.processes = data;
            this.closeDeleteDialog();
          },
          error: () => {
            alert('שגיאה ברענון נתונים');
            this.closeDeleteDialog();
          }
        });
      },
      error: () => {
        alert('שגיאה במחיקה');
        this.closeDeleteDialog();
      }
    });
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

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDeleteDialog();
    }
  }
}

