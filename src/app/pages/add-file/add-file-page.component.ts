import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AddFileComponent } from '../../components/add-file/add-file.component';

@Component({
  selector: 'app-add-file-page',
  standalone: true,
  imports: [RouterLink, AddFileComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <!-- <h1>הוספת קובץ חדש</h1>
        <a routerLink="/files" class="back-btn">חזרה לרשימה</a> -->
      </div>
      <app-add-file></app-add-file>
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
    .back-btn {
      background: #6c757d;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .back-btn:hover {
      background: #545b62;
    }
  `]
})
export class AddFilePageComponent {}