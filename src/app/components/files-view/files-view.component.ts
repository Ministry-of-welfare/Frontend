import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
import { EditProcessDialogComponent, EditProcessData } from '../edit-process-dialog/edit-process-dialog.component';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';
import { FileStatusService } from '../../services/fileStatus/file-status.service';
import { FileStatus } from '../../models/filleStatus.model';

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

  fileStatuses: FileStatus[] = [];
  fileStatusMap: { [key: number]: string } = {};
  @Input() systems: any[] = [];
  @Input() DataSourceType: any[] = [];
  @Input() searchCriteria: any = null;
  @Output() clearSearchEvent = new EventEmitter<void>();
  hasActiveSearch = false;

  liveStats = {
    processedToday: 0,
    activeJobs: 0,
    successRate: 0
  };

  pendingFiles = [
    { name: 'קובץ לקוחות.csv', waitTime: '5 דק\'', position: 1 },
    { name: 'נתוני מכירות.xlsx', waitTime: '12 דק\'', position: 2 },
    { name: 'דוח חודשי.pdf', waitTime: '18 דק\'', position: 3 }
  ];

  topErrors = [
    { type: 'שגיאת פורמט CSV', count: 15 },
    { type: 'קובץ לא נמצא', count: 8 },
    { type: 'שגיאת הרשאות', count: 5 }
  ];

  throughputStats = {
    currentRate: 45,
    dailyVolume: 2.3,
    avgProcessTime: 3.2
  };

  dataQuality = {
    completeness: 94,
    accuracy: 87,
    consistency: 91
  };

  recentAlerts = [
    { message: 'עומס גבוה במערכת', time: 'לפני 5 דק\'', severity: 'warning' },
    { message: 'שגיאה בעיבוד קובץ', time: 'לפני 12 דק\'', severity: 'error' },
    { message: 'עדכון מערכת הושלם', time: 'לפני 25 דק\'', severity: 'info' }
  ];

  problematicAreas = [
    { location: 'שרת עיבוד #2', description: 'ביצועים איטיים', severity: 'medium' },
    { location: 'מסד נתונים ראשי', description: 'שימוש גבוה בזיכרון', severity: 'high' },
    { location: 'רשת פנימית', description: 'חיבור לא יציב', severity: 'low' }
  ];

  constructor(
    private importDS: ImportDataSourceService,
    private router: Router,
    private systemsService: SystemsService,
    private DataTypeService: DataSourceTypeService
    , private fileStatusService: FileStatusService
  ) {}

  ngOnInit(): void {
    // ברירת-מחדל: הצג את 'כל הסטטוסים' כבר בטעינת העמוד
    if (!this.searchCriteria) {
      this.searchCriteria = {
        query: '',
        system: 'כל המערכות',
        type: 'כל הסוגים',
        status: 'כל הסטטוסים'
      };
    }

    this.loadProcesses();
    this.loadSystems();
    this.lloadDataSourceType();
    this.loadFileStatuses();
  }

  ngOnChanges(): void {
    console.log('FilesViewComponent.ngOnChanges - searchCriteria:', this.searchCriteria, 'processes.length:', this.processes?.length);
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
    this.importDS.getAll().subscribe({
      next: (data) => {
        // Use only server-provided data; if empty, leave arrays empty and stop loading spinner
        this.processes = data || [];
        this.filteredProcesses = this.processes;
        this.loading = false;
        this.applyStatusMapping();
        this.filterProcesses();
      },
      error: (err) => {
        console.error('שגיאה בקבלת נתונים מהשרת:', err);
        // keep processes empty to avoid showing local/hardcoded entries
        this.processes = [];
        this.filteredProcesses = [];
        this.loading = false;
      }
    });
  }

  loadFileStatuses(): void {
    this.fileStatusService.getAll().subscribe({
      next: (data) => {
        this.fileStatuses = data || [];
        this.fileStatusMap = {};
        this.fileStatuses.forEach(s => {
          if (s.fileStatusId !== undefined && s.fileStatusDesc) {
            this.fileStatusMap[Number(s.fileStatusId)] = s.fileStatusDesc;
          }
        });
        // apply mapping to any already-loaded processes
          this.applyStatusMapping();
          // Re-run the filter after status labels are applied so default view (active/בהקמה)
          // shows the correct items without requiring the user to click Search.
          this.filterProcesses();
      },
      error: (err) => {
        console.error('שגיאה בטעינת סטטוסים:', err);
      }
    });
  }

  private applyStatusMapping() {
    if (!this.processes || this.processes.length === 0) return;
    this.processes = this.processes.map(p => {
      const id = p.fileStatusId ?? p.FileStatusId ?? p.status;
      let statusLabel = '';
      let statusClass = '';

      // Prefer server-provided foreign-key based status mapping
      if (typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(String(id)))) {
        const numericId = Number(id);
        statusLabel = this.fileStatusMap[numericId] || '';
        // Map classes from server label (Hebrew or english)
        if (statusLabel === 'פעיל' || statusLabel.toLowerCase() === 'active') statusClass = 'status-success';
        else if (statusLabel === 'לא פעיל' || statusLabel.toLowerCase() === 'inactive') statusClass = 'status-error';
        else if (statusLabel === 'בהקמה' || statusLabel.toLowerCase() === 'design' || statusLabel === 'בעיצוב') statusClass = 'status-warning';
        else statusClass = 'status-success';
      } else if (typeof id === 'string') {
        // If server returned a string status field (not FK), use it directly (expecting server values)
        statusLabel = p.status || '';
        statusClass = this.getStatusClass(p.status || '');
      }

      return {
        ...p,
        // If server didn't provide a mapped label, leave empty — UI will hide items without server status per requirement
        statusLabel: statusLabel,
        statusClass: statusClass
      };
    });
    // also update filteredProcesses to keep UI consistent
    this.filteredProcesses = this.filteredProcesses.map(p => ({
      ...p,
      statusLabel: p.statusLabel,
      statusClass: p.statusClass
    }));
  }

  filterProcesses(): void {
    if (!this.searchCriteria || 
        (!this.searchCriteria.query && 
         this.searchCriteria.system === 'כל המערכות' && 
         this.searchCriteria.type === 'כל הסוגים' && 
         this.searchCriteria.status === 'כל הסטטוסים')) {
      // Default view: show only items with server-resolved status 'פעיל' or 'בהקמה'
      this.filteredProcesses = this.processes.filter(p => {
        const resolved = p.statusLabel || this.fileStatusMap[Number(p.fileStatusId ?? p.FileStatusId ?? -1)] || (p.status ? this.formatStatus(p.status) : '');
        const isActive = (resolved === 'פעיל' || resolved?.toLowerCase() === 'active');
        const isDesign = (resolved === 'בהקמה' || resolved?.toLowerCase() === 'design' || resolved === 'בעיצוב');
        return isActive || isDesign;
      });
      this.hasActiveSearch = false;
      return;
    }

    this.hasActiveSearch = true;
    
    this.filteredProcesses = this.processes.filter(process => {
      // Determine resolved label for the process
      const resolvedLabel = process.statusLabel || this.fileStatusMap[Number(process.fileStatusId ?? process.FileStatusId ?? -1)] || this.formatStatus(process.status);

      // If the resolved label indicates 'not active' (Hebrew or English) only include it
      // when the user explicitly selected that status in searchCriteria.
      const isInactive = (resolvedLabel === 'לא פעיל' || resolvedLabel.toLowerCase() === 'inactive');
      const userRequestedInactive = this.searchCriteria && this.searchCriteria.status && (this.searchCriteria.status === 'לא פעיל' || this.searchCriteria.status.toLowerCase() === 'inactive');
      if (isInactive && !userRequestedInactive) {
        return false; // hide inactive unless explicitly requested
      }
      const matchesQuery = !this.searchCriteria.query || 
        process.importDataSourceDesc?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.tableName?.toLowerCase().includes(this.searchCriteria.query.toLowerCase()) ||
        process.jobName?.toLowerCase().includes(this.searchCriteria.query.toLowerCase());

      const matchesSystem = this.searchCriteria.system === 'כל המערכות' || 
        this.getSystemName(process.systemId) === this.searchCriteria.system;

      const matchesType = this.searchCriteria.type === 'כל הסוגים' || 
        this.getDataSourceTypeName(process.dataSourceTypeId) === this.searchCriteria.type;

      // Resolve the status label to compare against the UI selection
      const resolvedStatusLabel = resolvedLabel;

      let matchesStatus = false;
      if (this.searchCriteria.status === 'כל הסטטוסים') {
        // Default page view: show only 'פעיל' and 'בהקמה'
        const isActive = (resolvedStatusLabel === 'פעיל' || resolvedStatusLabel?.toLowerCase() === 'active');
        const isDesign = (resolvedStatusLabel === 'בהקמה' || resolvedStatusLabel?.toLowerCase() === 'design' || resolvedStatusLabel === 'בעיצוב');
        matchesStatus = isActive || isDesign;
      } else {
        // User selected a specific status: strict match to the resolved server label
        const selected = this.searchCriteria.status;
        // Strict: only include when the server-resolved label equals the selected label.
        // As a minimal safety, if the resolved label is empty, compare the server `process.status` via formatStatus.
        if (resolvedStatusLabel) {
          matchesStatus = (resolvedStatusLabel === selected);
        } else {
          matchesStatus = (this.formatStatus(process.status) === selected) || (process.status === selected);
        }
      }

      return matchesQuery && matchesSystem && matchesType && matchesStatus;
    });
  }

  getSystemName(id: number | string): string {
    if (!id) return '—';
    const systemName = this.systemsMap[id];
    if (systemName) return systemName;
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

  // ✅ ולידציה תקינה לאימייל בעברית ובאנגלית
  private validateEmail(email: string): boolean {
    if (!email) return true;
    const pattern = /^[A-Za-z0-9._%+\u05D0-\u05EA-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return pattern.test(email.trim());
  }

  openEditDialog(process: any) {
    this.dialogIsEdit = true;
    this.dialogIsView = false;
    console.log('openEditDialog: raw process:', process);
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
endDate: this.formatDateForInput(
  process.endDate || process.EndDate || process.end_date
),      createdDate: this.formatDateForInput(process.insertDate || process.createdDate || process.created),
startDate: this.formatDateForInput(
  process.startDate || process.StartDate || process.start_date
),    
};

    // ✅ בדיקת תקינות כתובת המייל
    if (this.dialogData.errorRecipients && !this.validateEmail(this.dialogData.errorRecipients)) {
      alert('כתובת המייל אינה תקינה. יש להזין כתובת תקינה באנגלית או בעברית.');
      return;
    }

    console.log('openEditDialog: dialogData:', this.dialogData);
    this.dialogVisible = true;
  }

  openViewDialog(process: any) {
    this.dialogIsEdit = false;
    this.dialogIsView = true;
    console.log('openViewDialog: raw process:', process);
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
      endDate: this.formatDateForInput(process.endDate),
      createdDate: this.formatDateForInput(process.insertDate || process.createdDate || process.created),
      startDate: this.formatDateForInput(process.startDate)
    };
    console.log('openViewDialog: dialogData:', this.dialogData);
    this.dialogVisible = true;
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    try {
      if (typeof date === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${d.getFullYear()}-${month}-${day}`;
        }
      } else if (date instanceof Date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
      }
    } catch (e) {
      console.warn('formatDateForInput: failed to parse date', date, e);
    }
    return '';
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
        this.loadProcesses();
        this.closeDeleteDialog();
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
