import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EnvironmentsComponent } from "./components/environments/environments.component";
import { SearchFileComponent } from "./components/search-file/search-file.component";
import { LayoutComponent } from './layout/layout.component';
import { FilesViewComponent } from './components/files-view/files-view.component';
import { AddFileComponent } from './components/add-file/add-file.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, SearchFileComponent, EnvironmentsComponent, LayoutComponent, FilesViewComponent,AddFileComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
  searchCriteria: any = null;

  onSearch(criteria: any) {
    console.log('Search criteria received:', criteria);
    this.searchCriteria = { ...criteria };
  }
}