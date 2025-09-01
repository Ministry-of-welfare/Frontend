import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PersonComponent } from "./components/person/person.component";
import { HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,  PersonComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'empty-project';
}

