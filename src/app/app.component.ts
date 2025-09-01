import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NewComponent } from './components/new/new.component';
import { PersonComponent } from "./components/person/person.component";
import { HttpClientModule } from '@angular/common/http';
import { ClinicComponent } from "./components/clinic/clinic.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NewComponent, PersonComponent, HttpClientModule, ClinicComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
}

