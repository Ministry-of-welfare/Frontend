import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-file',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule ,CommonModule],
    
  templateUrl: './search-file.component.html',
  styleUrl: './search-file.component.css'
})
 export class SearchFileComponent {

  form: FormGroup;
 @Output() searchEvent = new EventEmitter<any>();   
  systems = ['כל המערכות', 'מערכת ניהול משאבי אנוש', 'מערכת תשלומים'];
  types = ['כל הסוגים', 'טעינה ועיבוד (טעינה+ בדיקת פורמט + בדיקות דאטה) ', 'טעינה ובדיקת פורמט', 'טעינה בלבד'];
  statuses = ['כל הסטטוסים','בתהליך קליטה','ממתין לקליטה', 'קליטה הסתיימה בהצלחה', 'קליטה הסתיימה בכשלון'];

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
     this.searchEvent.emit(this.form.value);
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