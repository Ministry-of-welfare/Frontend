import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EnvironmentsComponent } from "./components/environments/environments.component";
import { SearchFileComponent } from "./components/search-file/search-file.component";
import { LayoutComponent } from './layout/layout.component';
<<<<<<< Updated upstream

import { FilesViewComponent } from './components/files-view/files-view.component';


=======
import { FilesViewComponent } from './components/files-view/files-view.component';

>>>>>>> Stashed changes




@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< Updated upstream



  imports: [RouterOutlet,  HttpClientModule,SearchFileComponent, EnvironmentsComponent,LayoutComponent,FilesViewComponent],


=======
  imports: [RouterOutlet,  HttpClientModule, EnvironmentsComponent,LayoutComponent,FilesViewComponent],
>>>>>>> Stashed changes
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
}

