import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-file-confirmation',
  standalone: true,
  templateUrl: './add-file-confirmation.component.html',
  styleUrls: ['./add-file-confirmation.component.css']
})
export class AddFileConfirmationComponent {
  @Input() fileSummary: any;
  @Input() tableName: string = '';
  @Input() columnCount: number = 0;
  @Input() columnsType: string = 'VARCHAR(MAX)';
  @Input() success: boolean = false;
  @Input() error: boolean = false;
  @Output() back = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
}
