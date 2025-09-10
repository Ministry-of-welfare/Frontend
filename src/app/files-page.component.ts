import { Component } from '@angular/core';
import { SearchFileComponent } from './components/search-file/search-file.component';
import { FilesViewComponent } from './components/files-view/files-view.component';
import { AddFileComponent } from './components/add-file/add-file.component';

@Component({
  selector: 'app-files-page',
  standalone: true,
  imports: [SearchFileComponent, FilesViewComponent, AddFileComponent],
  template: `
    <div class="page-container">
      <h1>ניהול קבצים</h1>
      <app-search-file (searchEvent)="onSearch($event)"></app-search-file>
      <app-files-view [searchCriteria]="searchCriteria" (clearSearchEvent)="onClearSearch()"></app-files-view>
      <app-add-file></app-add-file>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    h1 {
      margin-bottom: 20px;
      color: #333;
    }
  `]
})
export class FilesPageComponent {
  searchCriteria: any = null;

  onSearch(criteria: any) {
    this.searchCriteria = { ...criteria };
  }

  onClearSearch() {
    this.searchCriteria = null;
  }
}