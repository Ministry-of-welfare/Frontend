import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImportStatusService } from '../../services/importStatus/import-status.service';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';
import { Systems } from '../../models/systems.model';

@Component({
  selector: 'app-search-file',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule ,CommonModule],
    
  templateUrl: './search-file.component.html',
  styleUrl: './search-file.component.css'
})
 export class SearchFileComponent {

  form: FormGroup;
 @Output() searchEvent = new EventEmitter<any>();   

  statuses: (string | undefined)[] = [];
  systems: any[] = [];
  types: any[] = [];
  
  // נתונים דמי
  dummyStats = {
    totalFiles: 1247,
    activeFiles: 89,
    pendingFiles: 12,
    errorFiles: 5
  };
  
  dummyResults = [
    {
      name: 'קובץ_לקוחות_2024.xlsx',
      system: 'מערכת א',
      type: 'אוטומטי',
      status: 'הושלם',
      time: '2 דקות',
      icon: '✅',
      statusClass: 'success'
    },
    {
      name: 'נתוני_מכירות_ינואר.csv',
      system: 'מערכת ב',
      type: 'ידני',
      status: 'מעבד',
      time: '5 דקות',
      icon: '⏳',
      statusClass: 'processing'
    },
    {
      name: 'רשימת_הזמנות.json',
      system: 'מערכת ג',
      type: 'מעורב',
      status: 'ממתין',
      time: '10 דקות',
      icon: '⚠️',
      statusClass: 'warning'
    }
  ];

  constructor(private fb: FormBuilder,
     private SystemsService: SystemsService,
     private DataSourceTypeService: DataSourceTypeService,
    private ImportStatusService: ImportStatusService) {
    this.form = this.fb.group({
      query: [''],
      system: ['כל המערכות'],
      type: ['כל הסוגים'],
      status: ['כל הסטטוסים']
    });
    
    // טעינת נתונים דמי במקום קריאות שרת
    this.loadDummyData();
  }
  
  loadDummyData() {
    // נתונים דמי במקום קריאות שרת
    this.statuses = ['פעיל', 'לא פעיל', 'ממתין', 'שגיאה', 'הושלם'];
    this.systems = [
      { id: 1, name: 'מערכת א (פעילה)' },
      { id: 2, name: 'מערכת ב (תחזוקה)' },
      { id: 3, name: 'מערכת ג (לא זמינה)' },
      { id: 4, name: 'מערכת ד (בדיקות)' }
    ];
    this.types = [
      { id: 1, name: 'אוטומטי' },
      { id: 2, name: 'ידני' },
      { id: 3, name: 'מעורב' },
      { id: 4, name: 'מתוזמן' }
    ];
  }

  ngOnInit() {
  //   this.ImportStatusService.getAll().subscribe(data => {
  //     this.statuses= data.map(item => item.importStatusDesc)
  // .filter((t): t is string => t !== undefined);
  // console.log(data)
  //   });
    // השארת הקוד המקורי כהערה למקרה שתרצי לחזור אליו
    
    this.ImportStatusService.getAll().subscribe(data => {
      this.statuses= data.map(item => item.importStatusDesc)
  .filter((t): t is string => t !== undefined);
  console.log(data)
    });

    this.SystemsService.getAll().subscribe(data => {
      this.systems = data.map(item => ({ id: item.SystemId, name: item.systemName }));
    });

    this.DataSourceTypeService.getAll().subscribe(data => {
      this.types = data.map(item => ({ id: item.DataSourceTypeId, name: item.dataSourceTypeDesc }));
    });
  
  }

  onSearch() {
     this.searchEvent.emit(this.form.value);
  }

  onClear() {
    this.form.reset({
      query: '',
      system: 'כל המערכות',
      type: 'כל הסוגים',
      status: 'כל הסטטוסים'
    });
    this.searchEvent.emit(this.form.value);
  }
}