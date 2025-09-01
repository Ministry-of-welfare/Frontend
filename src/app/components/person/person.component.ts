import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PersonService } from '../../services/person/person.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [ HttpClientModule], // ✅ חייב לכלול גם CommonModule
  templateUrl: './person.component.html',
  styleUrl: './person.component.css'
})
export class PersonComponent {
  personArray: Person[] = [];

  constructor(private personSrv: PersonService) {}

  ngOnInit() {
    this.personSrv.getAll().subscribe(arr => {
      this.personArray = arr;
    });
  }
}
