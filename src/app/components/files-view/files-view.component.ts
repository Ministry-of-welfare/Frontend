import { Component } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.css']
})export class FilesViewComponent {
  viewMode: 'cards' | 'table' = 'cards';
  processes = [
    {
      name: 'קבוצת קליטת עובדים סוציאליים',
      schema: 'BULK_SOCIAL_WORKERS',
      system: 'משאבי אנוש',
      status: 'active',
      type: 'מערכת קליטה',
      created: '15.1.2025',
      updated: '1.9.2025',
      file: 'ImportSocialWorkersJob'
    },
    {
      name: 'קליטת שעות מ-OkToGo',
      schema: 'BULK_HOURS_OKTOGO',
      system: 'מערכת נוכחות',
      status: 'active',
      type: 'מערכת נוכחות',
      created: '20.1.2025',
      updated: '2.9.2025',
      file: 'ImportOkToGoHoursJob'
    },
    {
      name: 'קליטת ניהול סופרים',
      schema: 'BULK_PACKAGES_DATA',
      system: 'מערכת דוחות',
      status: 'warning',
      type: 'מערכת דוחות',
      created: '5.2.2025',
      updated: '2.9.2025',
      file: 'ImportPackagesJob'
    },
    {
      name: 'קליטת נתוני מלונות חירום',
      schema: 'BULK_EMERGENCY_HOTELS',
      system: 'מערכת דיור',
      status: 'inactive',
      type: 'מערכת דיור',
      created: '30.8.2024',
      updated: '30.8.2025',
      file: 'ImportEmergencyHotelsJob'
    },
    {
      name: 'קליטת נתוני תמיכה לעובדים סוציאליים',
      schema: 'BULK_SOCIAL_WORKERS_SUPPORT',
      system: 'משאבי אנוש',
      status: 'inactive',
      type: 'מערכת קליטה',
      created: '13.2.2025',
      updated: '15.7.2025',
      file: 'ImportSupportSocialWorkersJob'
    }
  ];

  setView(mode: 'cards' | 'table') {
    this.viewMode = mode;
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'active': return 'פעיל';
      case 'inactive': return 'לא פעיל';
      default: return status;
    }
  }
}

