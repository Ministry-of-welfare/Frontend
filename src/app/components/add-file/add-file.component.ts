import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportDataSources } from '../../models/importDataSources.model';
import { ImportDataSourceColumn } from '../../models/importDataSourceColumn.model';
import { ImportDataSourceColumnService } from '../../services/importDataSourceColumn/import-data-source-column.service';
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
  urlFileAfterCustomWarning: string = '';

  onUrlFileAfterInput = (value: string) => {
    if (!value) {
      this.urlFileAfterCustomWarning = '';
      return;
    }
    if (!value.includes('\\')) {
      this.urlFileAfterCustomWarning = 'נתיב קבצים מעובדים חייב להכיל לפחות תו \\ אחד';
      return;
    }
    const justLetters = value.replace(/\\/g, '');
    const allowedRegex = /^[A-Za-z\u05D0-\u05EA0-9_\-\(\)\[\]]+$/u;
    if (justLetters.length > 0 && !allowedRegex.test(justLetters)) {
      this.urlFileAfterCustomWarning = 'ניתן להכניס רק אותיות, מספרים, _, -, (, ), [, ]';
      return;
    }
    // אם אין בכלל \ — ורק אז בודקים "רק אותיות"
    if (!value.includes('\\')) {
      const onlyLettersRegex = /^[A-Za-z\u05D0-\u05EA]+$/u;
      if (justLetters.length > 0 && onlyLettersRegex.test(justLetters)) {
        this.urlFileAfterCustomWarning = 'נתיב קבצים מעובדים לא יכול להכיל רק אותיות';
        return;
      }
    }
    this.urlFileAfterCustomWarning = '';
  }
  getDataSourceLabel(): string {
    const opt = this.dataSourceOptions?.find(opt => String(opt.DataSourceTypeId) === this.dataSourceType);
    return opt ? (opt.dataSourceTypeDesc || '') : '';
  }

  getSystemLabel(): string {
    const opt = this.systemOptions?.find(opt => String(opt.SystemId) === this.systemType);
    return opt ? (opt.systemName || '') : '';
  }
  onTableNameInput(value: string) {
    const tableNameRegex = /^[A-Za-z0-9_]+$/;
    if (!value) {
      this.tableNameWarning = '';
      return;
    }
    if (!tableNameRegex.test(value)) {
      this.tableNameWarning = 'שם הטבלה חייב להיות באנגלית';
    } else {
      this.tableNameWarning = '';
    }
  }

  onUrlFileInput = (value: string) => {
    if (!value) {
      this.urlFileCustomWarning = '';
      return;
    }
    if (!value.includes('\\')) {
      this.urlFileCustomWarning = 'נתיב קבצי מקור חייב להכיל לפחות תו \\ אחד';
      return;
    }
    // אם יש תו \ — לא בודקים "רק אותיות"
    const justLetters = value.replace(/\\/g, '');
    // מותר: אותיות, מספרים, _, -, (, ), [, ]
    const allowedRegex = /^[A-Za-z\u05D0-\u05EA0-9_\-\(\)\[\]]+$/u;
    if (justLetters.length > 0 && !allowedRegex.test(justLetters)) {
      this.urlFileCustomWarning = 'ניתן להכניס רק אותיות, מספרים, _, -, (, ), [, ]';
      return;
    }
    // אם אין בכלל \ — ורק אז בודקים "רק אותיות"
    if (!value.includes('\\')) {
      const onlyLettersRegex = /^[A-Za-z\u05D0-\u05EA]+$/u;
      if (justLetters.length > 0 && onlyLettersRegex.test(justLetters)) {
        this.urlFileCustomWarning = 'נתיב קבצי מקור לא יכול להכיל רק אותיות';
        return;
      }
    }
    this.urlFileCustomWarning = '';
  }
  tableNameWarning: string = '';
  urlFileCustomWarning: string = '';
    requiredFieldsWarning: string = '';

  checkPath(field: 'urlFile' | 'urlFileAfter') {
    // פונקציה זו אינה נדרשת עוד כי הודעות השגיאה מוצגות דרך urlFileCustomWarning בלבד
    // אפשר למחוק או להשאיר ריק למניעת שגיאות קומפילציה
    return;
  }
  hebrewEmailWarning: boolean = false;

  checkHebrewEmail(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    const hebrewRegex = /[א-ת]/;
    this.hebrewEmailWarning = hebrewRegex.test(value);
  }
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
    private importDSColumn: ImportDataSourceColumnService,
    private systemsService: SystemsService,
    private dataSourceTypeService: DataSourceTypeService
  ) {}

  submitGeneralDetails() {
    // Validate required fields
    this.requiredFieldsWarning = '';
    this.tableNameWarning = '';
    this.urlFileCustomWarning = '';
    this.urlFileAfterCustomWarning = '';
    if (!this.description || !this.dataSourceType || !this.systemType || !this.jobName || !this.tableName || !this.urlFile || !this.urlFileAfter) {
      this.requiredFieldsWarning = 'אנא מלא את כל השדות החובה';
      return;
    }
    // Prevent continue if urlFile or urlFileAfter have validation errors
    this.onUrlFileInput(this.urlFile);
    this.onUrlFileAfterInput(this.urlFileAfter);
    if (this.urlFileCustomWarning || this.urlFileAfterCustomWarning) {
      return;
    }
    // Table name validation: English only
    const tableNameRegex = /^[A-Za-z0-9_]+$/;
      if (!tableNameRegex.test(this.tableName)) {
        this.tableNameWarning = 'שם הטבלה חייב להכיל אותיות באנגלית, מספרים וקו תחתון בלבד';
      return;
    } else {
      this.tableNameWarning = '';
    }
    // urlFile validation: must contain at least one \\ and not only letters
    if (!this.urlFile.includes('\\')) {
      this.urlFileCustomWarning = 'נתיב קבצי מקור חייב להכיל לפחות תו \\ אחד';
      return;
    }
    const onlyLettersRegex = /^[A-Za-z]+$/;
    if (onlyLettersRegex.test(this.urlFile.replace(/\\/g, ''))) {
      this.urlFileCustomWarning = 'נתיב קבצי מקור לא יכול להכיל רק אותיות';
      return;
    } else {
      this.urlFileCustomWarning = '';
    }
    // Email validation
    if (this.errorRecipients) {
      const emails = this.errorRecipients.split(/[,;\s]+/).filter(e => e);
      // Email must contain @, English letters, and can contain .
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const hebrewRegex = /[א-ת]/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      const hebrewEmails = emails.filter(email => hebrewRegex.test(email));
      if (hebrewEmails.length > 0) {
        alert('אזהרה: כתובת מייל מכילה אותיות בעברית: ' + hebrewEmails.join(', '));
        return;
      }
      if (invalidEmails.length > 0) {
        alert('כתובת מייל לא תקינה: ' + invalidEmails.join(', '));
        return;
      }
    }
    // Build the object according to ImportDataSources model
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
  tableName = '';
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
    console.log('טוען אפשרויות מהשרת...');
    this.systemsService.getAll().subscribe({
      next: (data: any[]) => {
        console.log('מערכות שנטענו:', data);
        // המרת נתונים מהשרת למודל
        this.systemOptions = data.map(item => ({
          SystemId: item.systemId,
          systemCode: item.systemCode,
          systemName: item.systemName,
          ownerEmail: item.ownerEmail
        }));
      },
      error: (err: any) => {
        console.error('שגיאה בטעינת מערכות:', err);
      }
    });
    this.dataSourceTypeService.getAll().subscribe({
      next: (data: any[]) => {
        console.log('סוגי קליטה שנטענו:', data);
        // המרת נתונים מהשרת למודל
        this.dataSourceOptions = data.map(item => ({
          DataSourceTypeId: item.dataSourceTypeId,
          dataSourceTypeDesc: item.dataSourceTypeDesc
        }));
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
    console.log('בדיקת שדות:');
    console.log('dataSourceType:', this.dataSourceType);
    console.log('systemType:', this.systemType);
    console.log('Number(dataSourceType):', Number(this.dataSourceType));
    console.log('Number(systemType):', Number(this.systemType));
    
    if (!this.dataSourceType || !this.systemType) {
      alert('אנא בחר סוג מקור נתונים ומערכת');
      return;
    }
    
    console.log('בדיקת שדות:');
    console.log('dataSourceType:', this.dataSourceType, 'Number:', Number(this.dataSourceType));
    console.log('systemType:', this.systemType, 'Number:', Number(this.systemType));
    console.log('dataSourceOptions:', this.dataSourceOptions);
    console.log('systemOptions:', this.systemOptions);
    
    const newFile: ImportDataSources = {
    importDataSourceDesc: this.description,
      dataSourceTypeId: Number(this.dataSourceType),
      systemId: Number(this.systemType),
      jobName: this.jobName,
      tableName: this.tableName || this.jobName || 'DefaultTable',
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
      next: (res: any) => {
        console.log('=== תשובת שרת מלאה ===');
        console.log('res:', res);
        console.log('typeof res:', typeof res);
        console.log('Object.keys(res):', Object.keys(res));
        console.log('=== ניסיון לחלץ ID ===');
        const importDataSourceId = res.importDataSourceId || res || res.ImportDataSourceId;
        console.log('importDataSourceId שהתקבל:', importDataSourceId);
        console.log('res.importDataSourceId:', res.importDataSourceId);
        console.log('res.id:', res.id);
        console.log('res.ImportDataSourceId:', res.ImportDataSourceId);
        console.log('מספר עמודות:', this.columns.length);
        
        if (importDataSourceId && this.columns.length > 0) {
          console.log('קורא ל-saveColumns עם ID:', importDataSourceId);
          this.saveColumns(importDataSourceId);
        } else {
          console.log('לא קורא ל-saveColumns. ID:', importDataSourceId, 'עמודות:', this.columns.length);
          this.successMessageVisible = true;
          this.creatingFile = false;
          if (confirm('הקובץ נוצר בהצלחה! האם תרצה לחזור לרשימת הקבצים?')) {
            window.location.href = '/files';
          }
        }
      },
      error: (err) => {
        console.error('createFile: שגיאה בשליחת נתונים לשרת:', err);
        this.errorMessageVisible = true;
        this.creatingFile = false;
      }
    });
  }

  saveColumns(importDataSourceId: number) {
    console.log('=== התחלת saveColumns ===');
    console.log('importDataSourceId:', importDataSourceId);
    console.log('columns:', this.columns);
    
    let savedCount = 0;
    const totalColumns = this.columns.length;
    
    this.columns.forEach((col, index) => {
      const columnData: ImportDataSourceColumn = {
        importDataSourceId: importDataSourceId,
        orderId: col.order,
        columnName: col.nameEng,
        formatColumnId:3,

        columnNameHebDescription: col.nameHeb
      };
      
      console.log(`שולח עמודה ${index + 1}:`, columnData);
      
      this.importDSColumn.addImportDataSource(columnData).subscribe({
        next: (res) => {
          savedCount++;
          console.log(`עמודה ${savedCount}/${totalColumns} נשמרה:`, res);
          if (savedCount === totalColumns) {
            console.log('כל העמודות נשמרו, קורא ל-createTable');
            this.importDS.createTable(importDataSourceId).subscribe({
              next: (res) => {
                console.log('טבלה נוצרה בהצלחה:', res);
                this.successMessageVisible = true;
                this.creatingFile = false;
                if (confirm('הקובץ, העמודות והטבלה נוצרו בהצלחה! האם תרצה לחזור לרשימת הקבצים?')) {
                  window.location.href = '/files';
                }
              },
              error: (err) => {
                console.error('שגיאה ביצירת טבלה:', err);
                console.error('פרטי השגיאה:', err.error);
                console.error('סטטוס:', err.status);
                console.error('הודעה:', err.message);
                this.errorMessageVisible = true;
                this.creatingFile = false;
              }
            });
          }
        },
        error: (err) => {
          console.error(`שגיאה בשמירת עמודה ${index + 1}:`, err);
          console.error('פרטי שגיאה:', err.error);
          this.errorMessageVisible = true;
          this.creatingFile = false;
        }
      });
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


  onDataSourceTypeChange() {
    console.log('סוג קליטה שונה ל:', this.dataSourceType);
  }

  onSystemTypeChange() {
    console.log('מערכת שונתה ל:', this.systemType);
  }


}