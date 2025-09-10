import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportDataSources } from '../../models/importDataSources.model';

export interface EditProcessData {
  importDataSourceId?: string;
  dataSourceId?: string;
  importDataSourceDesc?: string;
  type?: string;
  systemId?: string;
  jobName?: string;
  tableName?: string;
  urlFile?: string;
  urlFileAfterProcess?: string;
  errorRecipients?: string;
  endDate?: string;
  createdDate?: string;
  startDate?: string;
}

@Component({
  selector: 'app-edit-process-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-process-dialog.component.html',
  styleUrls: ['./edit-process-dialog.component.css'],
  providers: [ImportDataSourceService]
})
export class EditProcessDialogComponent {
  @Input() visible: boolean = false;
  @Input() data: EditProcessData = {};
  @Input() isEdit: boolean = false;
  @Input() isView: boolean = false;
  @Output() confirm = new EventEmitter<EditProcessData>();
  @Output() cancel = new EventEmitter<void>();

  // שדות שגיאה
  errors: any = {};

  // מערכות לדוגמה
  systems = [
    { value: 'HR_SYSTEM', label: 'מערכת משאבי אנוש' },
    { value: 'FINANCE_SYSTEM', label: 'מערכת כספים' },
    { value: 'CRM_SYSTEM', label: 'מערכת לקוחות' }
  ];

  successMessage: string = '';
  errorMessage: string = '';

  constructor(private importDataSourceService: ImportDataSourceService) {}

  validate(): boolean {
    this.errors = {};
    let ok = true;
  const textRegex = /^[a-zA-Zא-ת0-9\-_\s]+$/;
  const pathRegex = /^[a-zA-Z0-9\\\-_\/\:\s]+$/;
  const emailRegex = /^[a-zA-Z0-9@.]+$/;

    if (!this.data.importDataSourceDesc || !textRegex.test(this.data.importDataSourceDesc)) {
      this.errors.importDataSourceDesc = 'שדה חובה. השתמש/י באותיות, ספרות, "-", "_" בלבד.';
      ok = false;
    }
    if (!this.data.systemId) {
      this.errors.systemId = 'יש לבחור מערכת.';
      ok = false;
    }
    if (!this.data.jobName || !textRegex.test(this.data.jobName)) {
      this.errors.jobName = 'שדה חובה. השתמש/י באותיות, ספרות, "-", "_" בלבד.';
      ok = false;
    }
    if (!this.data.urlFile || !pathRegex.test(this.data.urlFile)) {
      this.errors.urlFile = 'שדה חובה. השתמש/י בתווים מותרים בלבד.';
      ok = false;
    }
    if (!this.data.urlFileAfterProcess || !pathRegex.test(this.data.urlFileAfterProcess)) {
      this.errors.urlFileAfterProcess = 'שדה חובה. השתמש/י בתווים מותרים בלבד.';
      ok = false;
    }
    if (!this.data.errorRecipients || !this.data.errorRecipients.split(';').every(e => emailRegex.test(e.trim()))) {
      this.errors.errorRecipients = 'יש להזין כתובות מייל תקינות מופרדות ב-";".';
      ok = false;
    }
    if (!this.data.startDate) {
      this.errors.startDate = 'יש להזין תאריך התחלה.';
      ok = false;
    }
    if (!this.data.endDate) {
      this.errors.endDate = 'יש להזין תאריך סיום.';
      ok = false;
    }
    if (this.data.startDate && this.data.endDate && new Date(this.data.startDate) >= new Date(this.data.endDate)) {
      this.errors.endDate = 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה.';
      ok = false;
    }
    return ok;
  }

  onConfirm() {
    if (this.isEdit && this.validate()) {
      // המרת נתונים למודל ImportDataSources
      const importDataSource: ImportDataSources = {
        importDataSourceId: Number(this.data.importDataSourceId || 0),
        importDataSourceDesc: this.data.importDataSourceDesc,
  dataSourceTypeId: 1,
        systemId: this.data.systemId ? Number(this.data.systemId) : undefined,
        jobName: this.data.jobName,
        tableName: this.data.tableName || '',
        urlFile: this.data.urlFile || '',
        urlFileAfterProcess: this.data.urlFileAfterProcess || '',
        endDate: this.data.endDate,
        errorRecipients: this.data.errorRecipients,
        insertDate: new Date().toISOString(),
        startDate: this.data.startDate
      };
      this.importDataSourceService.updateImportDataSource(importDataSource).subscribe({
        next: (result) => {
          this.successMessage = 'הנתונים עודכנו בהצלחה!';
          // המרה חזרה ל-EditProcessData
          if (result) {
            const emitData = {
              ...result,
              importDataSourceId: result.importDataSourceId != null ? result.importDataSourceId.toString() : '',
              systemId: result.systemId != null ? result.systemId.toString() : '',
              endDate: result.endDate ? result.endDate.toString() : undefined,
              startDate: result.startDate ? result.startDate.toString() : undefined
            };
            this.confirm.emit(emitData);
          }
          this.visible = false;
        },
        error: (err) => {
          this.errorMessage = 'אירעה שגיאה בעדכון הנתונים.';
        }
      });
    } else if (!this.isEdit) {
      this.confirm.emit(this.data);
      this.visible = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
  }
}
