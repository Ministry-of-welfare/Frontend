import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule, EditProcessDialogComponent],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})
export class FilesViewComponent implements OnChanges {
  viewMode: 'cards' | 'table' = 'cards';
  processes: any[] = [];
  filteredProcesses: any[] = [];
  loading = true;
  systemsMap: { [key: string]: string } = {}; 
  DataSourceTypeMap: { [key: string]: string } = {}; 
  @Input() systems: any[] = [];
  @Input() DataSourceType: any[] = [];
  @Input() searchCriteria: any = null;
  @Output() clearSearchEvent = new EventEmitter<void>();
  hasActiveSearch = false;

  constructor(
    private importDS: ImportDataSourceService,
    private router: Router,
    private systemsService: SystemsService,
    private DataTypeService: DataSourceTypeService
  ) {}

  ngOnInit(): void {
    this.loadProcesses();
    this.loadSystems();
    this.lloadDataSourceType();
  }

  ngOnChanges(): void {
    this.filterProcesses();
    if (this.systems && this.systems.length > 0) {
      this.systemsMap = {};
      this.systems.forEach(item => {
        const systemId = item.SystemId || item.systemId;
        const systemName = item.systemName || item.SystemName;
        if (systemId !== undefined && systemName) {
          this.systemsMap[systemId] = systemName;
        }
      });
    }

    if (this.DataSourceType && this.DataSourceType.length > 0) {
      this.DataSourceTypeMap = this.DataSourceType.reduce((acc: any, item: any) => {
        const typeId = item.dataSourceTypeId || item.DataSourceTypeId;
        const typeDesc = item.dataSourceTypeDesc || item.DataSourceTypeDesc;
        if (typeId && typeDesc) {
          acc[typeId] = typeDesc;
        }
        return acc;
      }, {});
   }
    this.filterProcesses();
  }

  loadProcesses(): void {
    const dummyData = [
      {
        id: 1,
        importDataSourceDesc: 'קליטת נתוני עובדים',
        tableName: 'BULK_EMPLOYEE_DATA',
        jobName: 'ImportEmployeeJob',
        systemId: 1,
        dataSourceTypeId: 'טעינה ועיבוד',
        status: 'active',
        createdDate: '2025-01-15',
        endDate: '2025-01-20'
      },
      {
        id: 2,
        importDataSourceDesc: 'קליטת נתוני לקוחות',
        tableName: 'BULK_CUSTOMERS',
        jobName: 'ImportCustomersJob',
        systemId: 2,
        dataSourceTypeId: 'טעינה בלבד',
        status: 'design',
        createdDate: '2025-01-10',
        endDate: '2025-01-18'
      }
    ];

    this.importDS.getAll().subscribe({
      next: (data) => {
        this.processes = (data && data.length > 0) ? data : dummyData;
        this.filteredProcesses = this.processes;
        this.loading = false;
        this.filterProcesses();
      },
      error: (err) => {
        console.error('שגיאה בקבלת נתונים, משתמש בנתוני דמה', err);
        this.processes = dummyData;
        this.filteredProcesses = dummyData;
        this.loading = false;
      }
    });
  }


  filterProcesses(): void {
    if (!this.searchCriteria || 
        (!this.searchCriteria.query && 
         this.searchCriteria.system === 'כל המערכות' && 
         this.searchCriteria.type === 'כל הסוגים' && 
         this.searchCriteria.status === 'כל הסטטוסים')) {
      this.filteredProcesses = this.processes;
      this.hasActiveSearch = false;
      return;
    }

    this.hasActiveSearch = true;
    
    this.filteredProcesses = this.processes.filter(process => {
      const matchesQuery = !this.searchCriteria.query || 
        process.importDataSourceDesc?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.tableName?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.jobName?.toLowerCase().includes(this.searchCriteria.query.toLowerCase());

      const matchesSystem = this.searchCriteria.system === 'כל המערכות' || 
        this.getSystemName(process.systemId) === this.searchCriteria.system;

      const matchesType = this.searchCriteria.type === 'כל הסוגים' || 
        this.getDataSourceTypeName(process.dataSourceTypeId) === this.searchCriteria.type;

      const matchesStatus = this.searchCriteria.status === 'כל הסטטוסים' ||
        process.status === this.searchCriteria.status ||
        this.formatStatus(process.status) === this.searchCriteria.status;

      return matchesQuery && matchesSystem && matchesType && matchesStatus;
    });
  }

  getSystemName(id: number | string): string {
    if (!id) return '—';
    // חיפוש במיפוי לפי ה-ID של התהליך
    const systemName = this.systemsMap[id];
    if (systemName) return systemName;
    
    // אם לא נמצא במיפוי, חפש ישירות במערכות
    const system = this.systems.find(s => s.SystemId === Number(id));
    return system ? system.systemName : id.toString();
  }
  getDataSourceTypeName(id: number | string): string {
    if (!id) return '—';
    return this.DataSourceTypeMap[id] || id.toString();
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
      case 'design': return 'בעיצוב';
      default: return status || 'פעיל';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-success';
      case 'inactive': return 'status-error';
      case 'design': return 'status-warning';
      default: return 'status-success';
    }
  }

  openEditDialog(process: any) {
    this.dialogIsEdit = true;
    this.dialogIsView = false;
    this.dialogData = {
      importDataSourceId: process.importDataSourceId || process.dataSourceId || process.id || '',
      importDataSourceDesc: process.importDataSourceDesc || process.name || '',
      type: process.type || 'FILE_IMPORT',
      systemId: process.systemId || '',
      jobName: process.jobName || process.file || '',
      tableName: process.tableName || process.schema || '',
      urlFile: process.urlFile || '',
      urlFileAfterProcess: process.urlFileAfterProcess || process.urlFileAfter || '',
      errorRecipients: process.errorRecipients || '',
      endDate: process.endDate || '',
      createdDate: process.createdDate || process.created || '',
      startDate: process.startDate || ''
    };
    this.dialogVisible = true;
  }

  openViewDialog(process: any) {
    this.dialogIsEdit = false;
    this.dialogIsView = true;
    this.dialogData = {
      dataSourceId: process.dataSourceId || process.id || '',
      importDataSourceDesc: process.importDataSourceDesc || process.name || '',
      type: process.type || 'FILE_IMPORT',
      systemId: process.systemId || '',
      jobName: process.jobName || process.file || '',
      tableName: process.tableName || process.schema || '',
      urlFile: process.urlFile || '',
      urlFileAfterProcess: process.urlFileAfterProcess || process.urlFileAfter || '',
      errorRecipients: process.errorRecipients || '',
      endDate: process.endDate || '',
      createdDate: process.createdDate || process.created || '',
      startDate: process.startDate || ''
    };
    this.dialogVisible = true;
  }

  openDeleteDialog(process: any) {
    console.log('openDeleteDialog called with:', process);
    this.selectedProcessToDelete = process;
    this.deleteDialogVisible = true;
    console.log('deleteDialogVisible set to:', this.deleteDialogVisible);
    console.log('selectedProcessToDelete:', this.selectedProcessToDelete);
  }

  closeDeleteDialog() {
    this.deleteDialogVisible = false;
    this.selectedProcessToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedProcessToDelete) return;
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
    };
    this.importDS.updateTheEndDate(updated.importDataSourceId).subscribe({
      next: () => {
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
    }
    this.dialogVisible = false;
  }

  onDialogCancel() {
    this.dialogVisible = false;
  }

  get displayedProcesses() {
    return this.filteredProcesses.map(p => ({
      ...p,
      startDate: p.startDate ? p.startDate.toString().split('T')[0] : p.startDate,
      endDate: p.endDate ? p.endDate.toString().split('T')[0] : p.endDate
    }));
  }

  clearFilter() {
    this.filteredProcesses = this.processes;
    this.hasActiveSearch = false;
    this.clearSearchEvent.emit();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDeleteDialog();
    }
  }
  loadSystems(): void {
    this.systemsService.getAll().subscribe({
      next: (data) => {
        this.systems = data;
        this.systemsMap = {};
        this.systems.forEach(item => {
          const systemId = item.SystemId || item.systemId;
          const systemName = item.systemName || item.SystemName;
          if (systemId !== undefined && systemName) {
            this.systemsMap[systemId] = systemName;
          }
        });
      },
      error: (err) => {
        console.error('שגיאה בטעינת מערכות:', err);
      }
    });
  }

  lloadDataSourceType(): void {
    this.DataTypeService.getAll().subscribe({
      next: (data) => {
        this.DataSourceType = data;
        this.DataSourceTypeMap = data.reduce((acc: any, item: any) => {
          const typeId = item.dataSourceTypeId || item.DataSourceTypeId;
          const typeDesc = item.dataSourceTypeDesc || item.DataSourceTypeDesc;
          if (typeId && typeDesc) {
            acc[typeId] = typeDesc;
          }
          return acc;
        }, {});
      },
      error: (err) => {
        console.error('שגיאה בטעינת סוגי מקורות נתונים:', err);
      }
    });
  }

}

