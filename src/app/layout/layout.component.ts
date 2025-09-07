import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
 searchResult: any;

  onSearch(data: any) {
    this.searchResult = data;   // מעביר את הנתונים לקומפוננטת התצוגה
  }
}
