import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EnvironmentsComponent } from "./components/environments/environments.component";
import { SearchFileComponent } from "./components/search-file/search-file.component";
import { LayoutComponent } from './components/layout/layout.component';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,  HttpClientModule,SearchFileComponent, EnvironmentsComponent,LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
}

