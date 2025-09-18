// import { Component } from '@angular/core';


// }
import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface ImportItem {
  id: number;
  date: string;
  department: string;
  role: string;
  employeeId: string;
  name: string;
  notes?: string;
  status: 'ok' | 'error' | 'pending';
}

@Component({
  selector: 'app-view-control',
  standalone: true,
  imports: [NgClass],
  templateUrl: './view-control.component.html',
  styleUrl: './view-control.component.css'
})
export class ViewControlComponent implements OnInit {

  items: ImportItem[] = [];

  ngOnInit() {
    this.items = [
      { id: 1, date: '2023-09-01', department: 'רווחה', role: 'עובד סוציאלי', employeeId: '12345', name: 'משה כהן', status: 'ok' },
      { id: 2, date: '2023-09-05', department: 'בריאות', role: 'רכז', employeeId: '67890', name: 'יוסי לוי', notes: 'חסר נתון', status: 'error' },
      { id: 3, date: '2023-09-12', department: 'חינוך', role: 'מתמחה', employeeId: '54321', name: 'שרה ישראלי', status: 'pending' },
    ];
  }

  statusClass(status: ImportItem['status']) {
    switch (status) {
      case 'ok': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  }
}
