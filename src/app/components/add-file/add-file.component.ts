import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { ImportDataSources } from '../../models/importDataSources.model';

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
  constructor(private importDS: ImportDataSourceService) {}
  submitGeneralDetails() {
    // Build the object according to ImportDataSources model
    const newFile: ImportDataSources = {
      importDataSourceDesc: this.description,
      dataSourceTypeId: Number(this.dataSourceType),
      systemId: Number(this.systemType),
      jobName: this.jobName,
      tableName: "",
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
      error: (err) => {
        alert('שגיאה בשליחת הפרטים');
        console.error('Error:', err);
      }
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

  updatePreview() {
    // preview is bound in template using Angular bindings
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
          window.location.href = '/files';
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
