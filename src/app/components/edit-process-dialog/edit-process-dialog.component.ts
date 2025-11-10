import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportDataSources } from '../../models/importDataSources.model';
import { LoginService } from '../../services/Login/login.service';

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
export class EditProcessDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() data: EditProcessData = {};
  @Input() isEdit: boolean = false;
  @Input() isView: boolean = false;
  @Output() confirm = new EventEmitter<EditProcessData>();
  @Output() cancel = new EventEmitter<void>();

  // שדות שגיאה
  errors: any = {};

  // Getter for formatted created date for template binding
  get formattedCreatedDate(): string {
    const date = this.data?.createdDate;
    if (!date) return '';
    let d: Date | null = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      d = new Date(date);
    } else if (date.includes('T')) {
      d = new Date(date);
    }
    if (d && !isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    const parts = date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  }

  // מערכות לדוגמה
  systems = [
    { value: 'HR_SYSTEM', label: 'מערכת משאבי אנוש' },
    { value: 'FINANCE_SYSTEM', label: 'מערכת כספים' },
    { value: 'CRM_SYSTEM', label: 'מערכת לקוחות' }
  ];

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private importDataSourceService: ImportDataSourceService,
    private loginService: LoginService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // כשהדיאלוג נפתח, נקה הודעות קודמות
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.clearMessages();
    }
  }

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
      // בדיקה שיש ID תקין
      if (!this.data.importDataSourceId || this.data.importDataSourceId === '' || this.data.importDataSourceId === '0') {
        this.errorMessage = 'שגיאה: לא נמצא מזהה תקין לעדכון';
        return;
      }

      // המרת systemId בבטיחות
      let systemIdNumber: number | undefined = undefined;
      if (this.data.systemId && this.data.systemId !== '') {
        const parsed = Number(this.data.systemId);
        if (!isNaN(parsed)) {
          systemIdNumber = parsed;
        }
      }

      // המרת נתונים למודל ImportDataSources
      const importDataSource: ImportDataSources = {
        importDataSourceId: Number(this.data.importDataSourceId),
        importDataSourceDesc: this.data.importDataSourceDesc,
        fileStatusId: 1, // ברירת מחדל - פעיל
        dataSourceTypeId: 1,
        systemId: systemIdNumber,
        jobName: this.data.jobName,
        tableName: this.data.tableName || '',
        urlFile: this.data.urlFile || '',
        urlFileAfterProcess: this.data.urlFileAfterProcess || '',
        endDate: this.data.endDate,
        errorRecipients: this.data.errorRecipients,
        insertDate: this.data.createdDate || new Date().toISOString(),
        startDate: this.data.startDate
      };

      console.log('שליחת עדכון לשרת:', importDataSource);
      
      // עדכון ישיר עם הפורמט הנכון
      this.importDataSourceService.updateImportDataSource(importDataSource).subscribe({
        next: (result) => {
          console.log('עדכון הצליח:', result);
          this.successMessage = 'הנתונים עודכנו בהצלחה!';
          this.confirm.emit(this.data);
          this.visible = false;
        },
        error: (err) => {
          console.error('שגיאה בעדכון:', err);
          if (err.status === 404) {
            this.errorMessage = `הרשומה עם מזהה ${this.data.importDataSourceId} לא נמצאה בשרת.`;
          } else if (err.status === 0) {
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא בדוק שהשרת פועל.';
          } else {
            this.errorMessage = `שגיאה בעדכון: ${err.status} - ${err.statusText}`;
          }
        }
      });
    } else if (!this.isEdit) {
      this.confirm.emit(this.data);
      this.visible = false;
    }
  }

  onCancel() {
    this.clearMessages();
    this.cancel.emit();
    this.visible = false;
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errors = {};
  }

  canEdit(): boolean {
    return this.loginService.canEdit();
  }
}
