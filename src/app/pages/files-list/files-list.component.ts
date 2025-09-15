import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FilesViewComponent } from '../../components/files-view/files-view.component';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [RouterLink, FilesViewComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>רשימת קבצים</h1>
        <a routerLink="/add-file" class="add-btn">הוסף קובץ חדש</a>
      </div>
      <app-files-view></app-files-view>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      color: #333;
    }
    .add-btn {
      background: #007bff;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .add-btn:hover {
      background: #0056b3;
    }
  `]
})
export class FilesListComponent {
}