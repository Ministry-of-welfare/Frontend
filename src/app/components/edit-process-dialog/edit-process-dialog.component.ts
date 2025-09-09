import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface EditProcessData {
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
  styleUrls: ['./edit-process-dialog.component.css']
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

  validate(): boolean {
    this.errors = {};
    let ok = true;
    const textRegex = /^[a-zA-Zא-ת0-9\-_\s]+$/;
    const pathRegex = /^[a-zA-Z0-9\-_\/\:\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (this.validate()) {
      this.confirm.emit(this.data);
      this.visible = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.visible = false;
  }
}
