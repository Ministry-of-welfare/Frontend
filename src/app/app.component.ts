import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { EnvironmentsComponent } from "./components/environments/environments.component";
import { LayoutComponent } from './layout/layout.component';
<<<<<<< HEAD
import { FilesViewComponent } from './components/files-view/files-view.component';
=======
>>>>>>> 93b526501e3cf6c68a0ac5e76eec4bb31bcab239




@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet,  HttpClientModule, EnvironmentsComponent,LayoutComponent,FilesViewComponent],
=======
  imports: [RouterOutlet,  HttpClientModule, EnvironmentsComponent,LayoutComponent],
>>>>>>> 93b526501e3cf6c68a0ac5e76eec4bb31bcab239
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
}

