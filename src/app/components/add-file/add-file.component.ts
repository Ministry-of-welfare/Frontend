import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportDataSources } from '../../models/importDataSources.model';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';
import { Systems } from '../../models/systems.model';
import { DataSourceType } from '../../models/dataSourceType.model';

interface Column {
  order: number;
  nameEng: string;
  nameHeb: string;
  type: string;
}
@Component({
  selector: 'app-add-file',
  standalone: true,
  imports: [NgClass,FormsModule, CommonModule],
  templateUrl: './add-file.component.html',
  styleUrl: './add-file.component.css'
})
export class AddFileComponent implements OnInit {
  getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }
  getColumnError(i: number): { nameHeb: string; nameEng: string } {
    const err = this.columnErrors[i] ?? {};
    return { nameHeb: err.nameHeb ?? '', nameEng: err.nameEng ?? '' };
  }
  isColumnsValid(): boolean {
    if (this.currentStep !== 2) return true;
    for (let idx = 0; idx < this.columns.length; idx++) {
      if (this.columnErrors[idx]?.nameEng || this.columnErrors[idx]?.nameHeb) {
        return false;
      }
      if (!this.columns[idx].nameEng || !this.columns[idx].nameHeb) {
        return false;
      }
    }
    return true;
  }
  columnErrors: { nameEng?: string; nameHeb?: string }[] = [];
  dataSourceOptions: DataSourceType[] = [];
  systemOptions: Systems[] = [];
  constructor(
    private importDS: ImportDataSourceService,
    private systemsService: SystemsService,
    private dataSourceTypeService: DataSourceTypeService
  ) {}
  tableName = '';

  submitGeneralDetails() {
    if (!this.tableName) {
      alert('אנא מלא את שם הטבלה');
      return;
    }
    // Build the object according to ImportDataSources model
    const newFile: ImportDataSources = {
      importDataSourceDesc: this.description,
      dataSourceTypeId: Number(this.dataSourceType),
      systemId: Number(this.systemType),
      jobName: this.jobName,
      tableName: this.tableName,
      urlFile: this.urlFile,
      urlFileAfterProcess: this.urlFileAfter,
      errorRecipients: this.errorRecipients,
      insertDate: new Date().toISOString(),
      startDate: undefined,
      endDate: undefined
    };
    this.importDS.addImportDataSource(newFile).subscribe({
      next: (res) => {
        alert('הפרטים נשלחו בהצלחה!');
        console.log('Success:', res);
      },
    });
  }
currentStep = 1;

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
  // ...existing code...

  ngOnInit(): void {
    this.initColumns();
    this.loadDraft();
    this.loadOptionsFromServer();
  }

  loadOptionsFromServer() {
    this.systemsService.getAll().subscribe({
      next: (data: Systems[]) => {
        this.systemOptions = data;
      },
      error: (err: any) => {
        console.error('שגיאה בטעינת מערכות:', err);
      }
    });
    this.dataSourceTypeService.getAll().subscribe({
      next: (data: DataSourceType[]) => {
        this.dataSourceOptions = data;
      },
      error: (err: any) => {
        console.error('שגיאה בטעינת סוגי קליטה:', err);
      }
    });
  }

  initColumns() {
    this.columns = [];
  this.columnErrors = [];
    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({ order: i + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
      this.columnErrors.push({ nameEng: '', nameHeb: '' });
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 3) {
        this.currentStep++;
        if (this.currentStep === 3) {
          this.updatePreview();
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
  let valid = true;
  this.columnErrors = [];
      const hebrewRegex = /^[א-ת\s\-_,.()\[\]{}0-9]+$/;
      const englishRegex = /^[A-Za-z\s\-_,.()\[\]{}0-9]+$/;
      this.columns.forEach((col, idx) => {
        if (!col.nameEng) {
          this.columnErrors[idx] = { ...this.columnErrors[idx], nameEng: 'יש למלא שם עמודה באנגלית' };
          valid = false;
        } else if (!englishRegex.test(col.nameEng)) {
          this.columnErrors[idx] = { ...this.columnErrors[idx], nameEng: 'יש להכניס רק אותיות באנגלית' };
          valid = false;
        }
        if (!col.nameHeb) {
          this.columnErrors[idx] = { ...this.columnErrors[idx], nameHeb: 'יש למלא שם עמודה בעברית' };
          valid = false;
        } else if (!hebrewRegex.test(col.nameHeb)) {
          this.columnErrors[idx] = { ...this.columnErrors[idx], nameHeb: 'יש להכניס רק אותיות בעברית' };
          valid = false;
        }
      });
      if (!valid) {
        return false;
      }
    }
    return true;
  }

  onColumnInput(idx: number, field: 'nameEng' | 'nameHeb', value: string) {
    if (!this.columnErrors[idx]) this.columnErrors[idx] = {};
    if (field === 'nameEng') {
      const englishRegex = /^[A-Za-z\s\-_,.()\[\]{}0-9]+$/;
      if (!value) {
        this.columnErrors[idx].nameEng = 'יש למלא שם עמודה באנגלית';
      } else if (!englishRegex.test(value)) {
        this.columnErrors[idx].nameEng = 'יש להכניס רק אותיות באנגלית';
      } else {
        this.columnErrors[idx].nameEng = '';
      }
    }
    if (field === 'nameHeb') {
      const hebrewRegex = /^[א-ת\s\-_,.()\[\]{}0-9]+$/;
      if (!value) {
        this.columnErrors[idx].nameHeb = 'יש למלא שם עמודה בעברית';
      } else if (!hebrewRegex.test(value)) {
        this.columnErrors[idx].nameHeb = 'יש להכניס רק אותיות בעברית';
      } else {
        this.columnErrors[idx].nameHeb = '';
      }
    }
    // מחיקת אובייקט שגיאה אם אין שגיאות בכלל
    if (!this.columnErrors[idx].nameEng && !this.columnErrors[idx].nameHeb) {
      delete this.columnErrors[idx];
    }
  }
  updateColumnCount() {
    this.columns = [];
    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({ order: i + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
    }
  }

  addColumn() {
  this.columns.push({ order: this.columns.length + 1, nameEng: '', nameHeb: '', type: 'VARCHAR' });
  this.columnErrors.push({ nameEng: '', nameHeb: '' });
  this.columnCount = this.columns.length;
  }

  deleteColumn(index: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק עמודה זו?')) {
      this.columns.splice(index, 1);
      this.columnErrors.splice(index, 1);
      this.columns.forEach((col, idx) => (col.order = idx + 1));
      this.columnCount = this.columns.length;
    }
  }

  updatePreview() {
    // preview is bound in template using Angular bindings
  }

  
  

  createFile() {
    console.log('createFile: התחלת תהליך יצירת קובץ');
    const newFile: ImportDataSources = {
      importDataSourceDesc: this.description,
      dataSourceTypeId: Number(this.dataSourceType),
      systemId: Number(this.systemType),
      jobName: this.jobName,
      tableName: '',
      urlFile: this.urlFile,
      urlFileAfterProcess: this.urlFileAfter,
      errorRecipients: this.errorRecipients,
      insertDate: new Date().toISOString(),
      startDate: undefined,
      endDate: undefined
    };
    console.log('createFile: נתונים שנשלחים לשרת:', newFile);
    this.creatingFile = true;
    this.successMessageVisible = false;
    this.errorMessageVisible = false;
    this.importDS.addImportDataSource(newFile).subscribe({
      next: (res) => {
        console.log('createFile: תשובת שרת:', res);
        this.successMessageVisible = true;
        this.creatingFile = false;
        if (confirm('הקובץ נוצר בהצלחה! האם תרצה לחזור לרשימת הקבצים?')) {
          window.location.href = '/files';
        }
      },
      error: (err) => {
        console.error('createFile: שגיאה בשליחת נתונים לשרת:', err);
        this.errorMessageVisible = true;
        this.creatingFile = false;
      }
    });
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
    const opt = this.dataSourceOptions?.find(opt => String(opt.DataSourceTypeId) === this.dataSourceType);
    return opt ? (opt.dataSourceTypeDesc || String(opt.DataSourceTypeId)) : '';
  }

  getSystemLabel(): string {
    const opt = this.systemOptions?.find(opt => String(opt.SystemId) === this.systemType);
    return opt ? (opt.systemName || String(opt.SystemId)) : '';
  }
}
