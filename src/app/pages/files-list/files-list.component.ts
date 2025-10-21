import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FilesViewComponent } from '../../components/files-view/files-view.component';
import { SystemsService } from '../../services/systems/systems.service';
import { SearchFileComponent } from '../../components/search-file/search-file.component';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [SearchFileComponent, FilesViewComponent],
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.css']
})
export class FilesListComponent {
  // Initialize with the same defaults the FilesView expects so it shows results on first load
  searchCriteria: any = {
    query: '',
    system: 'כל המערכות',
    type: 'כל הסוגים',
    status: 'כל הסטטוסים'
  };
systems: any[] = [];


constructor(private systemsService: SystemsService) {}

ngOnInit() {
  this.systemsService.getAll().subscribe({
    
    next: (data) => this.systems = data,

    error: (err) => console.error('שגיאה בטעינת מערכות', err)
  });
}
  getSystemNameById = (id: number | string): string => {
    if (!id || !this.systems || this.systems.length === 0) return '—';
    const system = this.systems.find(s =>
      String(s.SystemId) === String(id) ||
      String(s.systemId) === String(id)
     
      
    );
    return system ? (system.systemName || system.SystemName) : String(id);
  }
onSystemsLoaded(systems: any[]) {
  this.systems = systems;
}
  onSearch(criteria: any) {
    console.log('FilesListComponent.onSearch called with:', criteria);
    this.searchCriteria = { ...criteria };
  }

  onClearSearch() {
    this.searchCriteria = null;
  }
}