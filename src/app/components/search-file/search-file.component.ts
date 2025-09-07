import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-file',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule ],
    
  templateUrl: './search-file.component.html',
  styleUrl: './search-file.component.css'
})
 export class SearchFileComponent {

  form: FormGroup;

  systems = ['כל המערכות', 'מערכת א', 'מערכת ב'];
  types = ['כל הסוגים', 'סוג 1', 'סוג 2'];
  statuses = ['כל הסטטוסים', 'פעיל', 'לא פעיל'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      query: [''],
      system: ['כל המערכות'],
      type: ['כל הסוגים'],
      status: ['כל הסטטוסים']
    });
  }

  onSearch() {
    console.log('Search data:', this.form.value);
  }

  onClear() {
    this.form.reset({
      query: '',
      system: 'כל המערכות',
      type: 'כל הסוגים',
      status: 'כל הסטטוסים'
    });
  }
}