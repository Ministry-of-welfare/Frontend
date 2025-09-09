import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddFileConfirmationComponent } from '../add-file-confirmation/add-file-confirmation.component';

interface Column {
  order: number;
  nameEng: string;
  nameHeb: string;
  type: string;
}
@Component({
  selector: 'app-add-file',
  standalone: true,
  imports: [NgClass,FormsModule, CommonModule, AddFileConfirmationComponent],
  templateUrl: './add-file.component.html',
  styleUrl: './add-file.component.css'
})
export class AddFileComponent implements OnInit {
currentStep = 1;

  fileSummary: any[] = [];

  // Step 1 fields
  description = '';
  dataSourceType = '';
  systemType = '';
  jobName = '';
  urlFile = '';
  urlFileAfter = '';
  errorRecipients = '';

  // Step 2 fields
  columnCount = 3;
  columns: Column[] = [];

  // Step 3 fields
  successMessageVisible = false;
  errorMessageVisible = false;
  creatingFile = false;

  dataSourceOptions = [
    { value: '1', label: 'טעינה בלבד' },
    { value: '2', label: 'טעינה ובדיקת פורמט' },
    { value: '3', label: 'טעינה ועיבוד (טעינה + בדיקת פורמט + בדיקות דאטה)' },
  ];

  systemOptions = [
    { value: '1', label: 'מערכת כספות ראשית' },
    { value: '2', label: 'מערכת גיבוי' },
    { value: '3', label: 'מערכת דיווחים' },
    { value: '4', label: 'מערכת משאבי אנוש' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.initColumns();
    this.loadDraft();
  }

  initColumns() {
    this.columns = [];
    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({ order: i + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 3) {
        this.currentStep++;
        if (this.currentStep === 3) {
            this.prepareFileSummary();
        }
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      if (!this.description || !this.dataSourceType || !this.systemType || !this.urlFile || !this.urlFileAfter) {
        alert('אנא מלא את כל השדות החובה');
        return false;
      }
    }
    if (this.currentStep === 2) {
      if (this.columns.length === 0 || this.columns.some(c => !c.nameEng || !c.nameHeb)) {
        alert('אנא מלא את שמות כל העמודות');
        return false;
      }
    }
    return true;
  }

  updateColumnCount() {
    this.columns = [];
    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({ order: i + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
    }
  }

  addColumn() {
    this.columns.push({ order: this.columns.length + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
    this.columnCount = this.columns.length;
  }

  deleteColumn(index: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק עמודה זו?')) {
      this.columns.splice(index, 1);
      this.columns.forEach((col, idx) => (col.order = idx + 1));
      this.columnCount = this.columns.length;
    }
  }

  prepareFileSummary() {
    this.fileSummary = [
      { label: 'תיאור תהליך', value: this.description },
      { label: 'סוג קליטה', value: this.getDataSourceLabel() },
      { label: 'מערכת', value: this.systemOptions.find(opt => opt.value === this.systemType)?.label || '' },
      { label: 'נתיב קבצי מקור', value: this.urlFile },
      { label: 'נתיב קבצים מעובדים', value: this.urlFileAfter },
    ];
    if (this.jobName) {
      this.fileSummary.push({ label: 'שם Job', value: this.jobName });
    }
    if (this.errorRecipients) {
      this.fileSummary.push({ label: 'כתובות מייל לשגיאות', value: this.errorRecipients });
    }
  }

  generateTableName(description: string): string {
    let tableName = description
      .replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30)
      .toUpperCase();
    return `BULK_${tableName}`;
  }

  createFile() {
    this.creatingFile = true;
    this.successMessageVisible = false;
    this.errorMessageVisible = false;

    setTimeout(() => {
      const success = Math.random() > 0.2;
      this.creatingFile = false;
      if (success) {
        this.successMessageVisible = true;
        if (confirm('הקובץ נוצר בהצלחה! האם תרצה לחזור לרשימת הקבצים?')) {
          window.location.href = '#files-list';
        }
      } else {
        this.errorMessageVisible = true;
      }
    }, 2000);
  }

  saveDraft() {
    const data = {
      step: this.currentStep,
      description: this.description,
      columns: this.columns
    };
    localStorage.setItem('file_creation_draft', JSON.stringify(data));
  }

  loadDraft() {
    const draft = localStorage.getItem('file_creation_draft');
    if (draft) {
      const data = JSON.parse(draft);
      if (confirm('נמצאה טיוטה שמורה. האם תרצה לטעון אותה?')) {
        this.description = data.description || '';
        if (data.columns) {
          this.columns = data.columns;
          this.columnCount = this.columns.length;
        }
      }
    }
  }
  getDataSourceLabel(): string {
  const opt = this.dataSourceOptions?.find(opt => opt.value === this.dataSourceType);
  return opt ? opt.label : '';
}
}
