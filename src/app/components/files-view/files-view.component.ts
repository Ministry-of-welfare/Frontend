import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';

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
  @Input() searchCriteria: any = null;
  @Output() clearSearchEvent = new EventEmitter<void>();
  hasActiveSearch = false;

  constructor(private importDS: ImportDataSourceService, private router: Router) {}

  ngOnInit(): void {
    this.loadProcesses();
  }

  ngOnChanges(): void {
    this.filterProcesses();
  }

  loadProcesses(): void {
    this.importDS.getAll().subscribe({
      next: (data) => {
        this.processes = data || [];
        this.filteredProcesses = data || [];
        this.loading = false;
        this.filterProcesses();
      },
      error: (err) => {
        console.error('שגיאה בקבלת נתונים', err);
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
        process.systemId?.toString() === this.searchCriteria.system?.toString();

      const matchesType = this.searchCriteria.type === 'כל הסוגים' || 
        process.dataSourceTypeId?.toString() === this.searchCriteria.type?.toString();

      const matchesStatus = this.searchCriteria.status === 'כל הסטטוסים' ||
        process.status === this.searchCriteria.status ||
        this.formatStatus(process.status) === this.searchCriteria.status;

      return matchesQuery && matchesSystem && matchesType && matchesStatus;
    });
  }

  dialogVisible = false;
  dialogData: EditProcessData = {};
  dialogIsEdit = false;
  dialogIsView = false;

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
    return this.filteredProcesses;
  }

  clearFilter() {
    this.filteredProcesses = this.processes;
    this.hasActiveSearch = false;
    this.clearSearchEvent.emit();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }




}