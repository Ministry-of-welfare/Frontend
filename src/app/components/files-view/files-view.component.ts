import { Component } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { ImportDataSourceService } from '../../services/importDataSource/import-data-source.service';
@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})

export class FilesViewComponent {
  viewMode: 'cards' | 'table' = 'cards';
  processes: any[] = [];

  constructor(private importDS: ImportDataSourceService) {}

  ngOnInit(): void {
    this.importDS.getAll().subscribe({
      next: (data) => {
        this.processes = data;
        console.log('importDS נתונים מהשרת:', data);
      },
      error: (err) => {
        console.error('importDS שגיאה בקבלת נתונים', err);
      }
    });
  }

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
}

