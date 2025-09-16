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
  systems: any[] = [];
  types: any[] = [];


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
  //   this.ImportStatusService.getAll().subscribe(data => {
  //     this.statuses= data.map(item => item.importStatusDesc)
  // .filter((t): t is string => t !== undefined);
  // console.log(data)
  //   });

    this.SystemsService.getAll().subscribe(data => {
      this.systems = data.map(item => ({ id: item.SystemId, name: item.systemName }));
    });

    this.DataSourceTypeService.getAll().subscribe(data => {
      this.types = data.map(item => ({ id: item.DataSourceTypeId, name: item.dataSourceTypeDesc }));
    });
  }

  onSearch() {
     this.searchEvent.emit(this.form.value);
  }

  onClear() {
    this.form.reset({
      query: '',
      system: 'כל המערכות',
      type: 'כל הסוגים',
      status: 'כל הסטטוסים'
    });
    this.searchEvent.emit(this.form.value);
  }
}