import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImportStatusService } from '../../services/importStatus/import-status.service';
import { SystemsService } from '../../services/systems/systems.service';
import { DataSourceTypeService } from '../../services/dataSuorceType/data-source-type.service';
import { Systems } from '../../models/systems.model';

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

  statuses: (string | undefined)[] = [];
  systems: (string | undefined)[] = [];

  types: (string | undefined)[] = [];


  constructor(private fb: FormBuilder,
     private SystemsService: SystemsService,
     private DataSourceTypeService: DataSourceTypeService,
    private ImportStatusService: ImportStatusService) {
    this.form = this.fb.group({
      query: [''],
      system: ['כל המערכות'],
      type: ['כל הסוגים'],
      status: ['כל הסטטוסים']
    });
  }

  ngOnInit() {
    this.ImportStatusService.getAll().subscribe(data => {
      this.statuses= data.map(item => item.ImportStatusDesc)
  .filter((t): t is string => t !== undefined);
    });

    this.SystemsService.getAll().subscribe(data => {
      this.systems= data.map(item => item.systemName)
  .filter((t): t is string => t !== undefined);
      console.log(this.systems)
    });

    this.DataSourceTypeService.getAll().subscribe(data => {
     
      this.types = data.map(item => item.dataSourceTypeDesc)
  .filter((t): t is string => t !== undefined);

  
   
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