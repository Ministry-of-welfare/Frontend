import { Component, Input, OnChanges, Output, EventEmitter, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';
import { ImportStatusService } from '../../services/importStatus/import-status.service';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule, EditProcessDialogComponent, FormsModule],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})

export class FilesViewComponent implements OnInit, OnChanges {
  viewMode: 'cards' | 'table' = 'cards';
  processes: any[] = [];
  filteredProcesses: any[] = [];
  loading = true;
  @Input() searchCriteria: any = null;
  @Output() clearSearchEvent = new EventEmitter<void>();
  hasActiveSearch = false;
  
  // פילטרים
  filters = {
    status: '',
    type: '',
    system: '',
    search: ''
  };
  
  // נתוני רשימות נפתחות
  statusOptions: any[] = [];
  typeOptions: any[] = [];
  systemOptions: any[] = [];
  
  // מצב חיפוש
  searchPerformed = true;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private importDS: ImportDataSourceService, 
    private router: Router,
    private systemsService: SystemsService,
    private dataSourceTypeService: DataSourceTypeService,
    private importStatusService: ImportStatusService
  ) {}

  ngOnInit(): void {
    this.loadProcesses();
    this.loadFilterOptionsFromServices();
    console.log('Component initialized');
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  loadProcesses(): void {
    this.loading = true;
    
    this.importDS.getAll().subscribe({
      next: (data) => {
        this.processes = data || [];
        console.log('Loaded processes:', this.processes.length);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('שגיאה בקבלת נתונים מהשרת:', err);
        this.processes = [];
        this.loading = false;
      }
    });
  }
  

  
  loadFilterOptionsFromServices(): void {
    // טעינת מערכות
    this.systemsService.getAll().subscribe({
      next: (data) => {
        this.systemOptions = data.map(item => ({ 
          value: item.SystemId, 
          label: item.systemName 
        }));
      },
      error: (err) => console.error('שגיאה בטעינת מערכות:', err)
    });

    // טעינת סוגי קליטה
    this.dataSourceTypeService.getAll().subscribe({
      next: (data) => {
        this.typeOptions = data.map(item => ({ 
          value: item.DataSourceTypeId, 
          label: item.dataSourceTypeDesc 
        }));
      },
      error: (err) => console.error('שגיאה בטעינת סוגי קליטה:', err)
    });

    // טעינת סטטוסים
    this.statusOptions = [
      { value: 'active', label: 'פעיל' },
      { value: 'inactive', label: 'לא פעיל' },
      { value: 'design', label: 'בעיצוב' }
    ];
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    console.log('Total processes:', this.processes.length);
    
    let filtered = [...this.processes];
    
    if (this.filters.status) {
      filtered = filtered.filter(p => p.status === this.filters.status);
    }
    
    if (this.filters.type) {
      filtered = filtered.filter(p => p.dataSourceTypeId?.includes(this.filters.type));
    }
    
    if (this.filters.system) {
      filtered = filtered.filter(p => p.systemId?.includes(this.filters.system));
    }
    
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.importDataSourceDesc?.toLowerCase().includes(search) ||
        p.tableName?.toLowerCase().includes(search) ||
        p.jobName?.toLowerCase().includes(search)
      );
    }
    
    console.log('Filtered processes:', filtered.length);
    this.filteredProcesses = filtered;
    this.updatePagination();
  }
  
  onFiltersChange(): void {
    this.currentPage = 1;
    if (this.searchPerformed) {
      this.applyFilters();
    }
  }
  
  performSearch(): void {
    console.log('Search button clicked');
    console.log('Current filters:', this.filters);
    this.loading = true;
    this.currentPage = 1;
    
    // קריאה לשרת עם פרמטרי חיפוש
    this.importDS.search(this.filters).subscribe({
      next: (data) => {
        console.log('Search results from server:', data);
        this.processes = data || [];
        this.filteredProcesses = [...this.processes];
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('שגיאה בחיפוש מהשרת, משתמש בסינון מקומי:', err);
        // אם השרת לא תומך בחיפוש, נסנן מקומי
        if (this.processes.length > 0) {
          this.applyFilters();
        } else {
          // אם אין נתונים, נטען אותם מהשרת
          this.loadProcesses();
        }
        this.loading = false;
      }
    });
  }
  
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProcesses.length / this.itemsPerPage);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  getVisiblePages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
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
  this.selectedProcessToDelete = process;
  this.deleteDialogVisible = true;
  console.log('deleteDialogVisible:', this.deleteDialogVisible, 'selectedProcessToDelete:', this.selectedProcessToDelete);
  }

  closeDeleteDialog() {
    this.deleteDialogVisible = false;
    this.selectedProcessToDelete = null;
  }

  confirmDelete() {
    if (!this.selectedProcessToDelete) return;
    const id = this.selectedProcessToDelete.importDataSourceId;
      this.importDS.updateTheEndDate(id)
        .pipe(finalize(() => this.closeDeleteDialog()))
        .subscribe({
          next: () => {
            // עדכון מיידי בתצוגה
            const now = new Date().toISOString().split('T')[0];
            // עדכון גם ב-processes וגם ב-filteredProcesses
            [this.processes, this.filteredProcesses].forEach(list => {
              const proc = list.find(p => p.importDataSourceId === id);
              if (proc) proc.endDate = now;
            });
          },
          error: () => {
            alert('שגיאה בעדכון EndDate');
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
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    const result = this.filteredProcesses.slice(start, end).map(p => ({
      ...p,
      startDate: p.startDate ? p.startDate.toString().split('T')[0] : p.startDate,
      endDate: p.endDate ? p.endDate.toString().split('T')[0] : p.endDate
    }));
    
    console.log('DisplayedProcesses called, returning:', result.length, 'items');
    return result;
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

}

 


