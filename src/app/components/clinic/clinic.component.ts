import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Clinic } from '../../models/clinic.model';
import { ClinicService } from '../../services/clinic.service';

@Component({
  selector: 'app-clinic',
  standalone: true,
  imports: [ HttpClientModule], // ✅ חייב לכלול גם CommonModule
  templateUrl: './clinic.component.html',
  styleUrl: './clinic.component.css'
})
export class ClinicComponent {
  clinicArray: Clinic[] = [];

  constructor(private clinicSrv: ClinicService) {}

  ngOnInit() {
    
    this.clinicSrv.getAll().subscribe(arr => {
      this.clinicArray = arr;
    });
  }
}
