import { Component, Input, OnChanges } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
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
  hasActiveSearch = false;
  showData = false;
  dataStructure = '';

  constructor(private importDS: ImportDataSourceService) {}

  ngOnInit(): void {
    this.loadProcesses();
  }

  ngOnChanges(): void {
    console.log('ngOnChanges called with searchCriteria:', this.searchCriteria);
    this.filterProcesses();
  }

  loadProcesses(): void {
    console.log('Starting to load processes...');
    this.importDS.getAll().subscribe({
      next: (data) => {
        console.log('=== נתונים מהשרת ===');
        console.log('Total items:', data?.length || 0);
        console.log('First item structure:', data?.[0]);
        console.log('All data:', data);
        this.processes = data;
        this.filteredProcesses = data;
        this.loading = false;
        this.filterProcesses();
      },
      error: (err) => {
        console.error('=== שגיאה בקבלת נתונים ===', err);
        this.loading = false;
      }
    });
  }

  filterProcesses(): void {
    console.log('filterProcesses called with:', this.searchCriteria);
    console.log('Available processes:', this.processes);
    
    if (!this.searchCriteria || 
        (!this.searchCriteria.query && 
         this.searchCriteria.system === 'כל המערכות' && 
         this.searchCriteria.type === 'כל הסוגים' && 
         this.searchCriteria.status === 'כל הסטטוסים')) {
      this.filteredProcesses = this.processes;
      this.hasActiveSearch = false;
      console.log('No active search, showing all processes:', this.filteredProcesses.length);
      return;
    }

    this.hasActiveSearch = true;
    console.log('Active search detected');
    
    this.filteredProcesses = this.processes.filter(process => {
      console.log('Checking process:', process);
      
      const matchesQuery = !this.searchCriteria.query || 
        process.importDataSourceDesc?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.tableName?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.dataSourceTypeId?.toLowerCase().includes(this.searchCriteria.query.toLowerCase());

      const matchesSystem = this.searchCriteria.system === 'כל המערכות' || 
        process.systemId === this.searchCriteria.system ||
        process.systemName === this.searchCriteria.system;

      const matchesType = this.searchCriteria.type === 'כל הסוגים' || 
        process.dataSourceTypeId === this.searchCriteria.type ||
        process.dataSourceTypeDesc === this.searchCriteria.type;

      const matchesStatus = this.searchCriteria.status === 'כל הסטטוסים' || 
        process.importStatusDesc === this.searchCriteria.status ||
        process.status === this.searchCriteria.status;

      console.log('Match results:', { matchesQuery, matchesSystem, matchesType, matchesStatus });
      return matchesQuery && matchesSystem && matchesType && matchesStatus;
    });
    
    console.log('Filtered results:', this.filteredProcesses.length);
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
      default: return status;
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
  }

  showDataStructure() {
    this.showData = !this.showData;
    if (this.showData && this.processes.length > 0) {
      this.dataStructure = JSON.stringify(this.processes[0], null, 2);
    }
  }
}