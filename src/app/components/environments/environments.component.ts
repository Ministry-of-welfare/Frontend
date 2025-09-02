import { Component } from '@angular/core';
import { EnvironmentsService } from '../../services/environments/environments.service';
import { Environment } from '../../models/environment.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-environments',
  standalone: true,
  imports: [FormsModule ],
  templateUrl: './environments.component.html',
  styleUrl: './environments.component.css'
})
export class EnvironmentsComponent {
  constructor(private EnvironmentService: EnvironmentsService) {}
  EnvironmentArray: Environment[] = []

   environment: Environment = new Environment();
   id!: number;

  onSubmit() {
    this.EnvironmentService.create(this.environment).subscribe(res => {
     
    });
  }
  onGetAll() {
    this.EnvironmentService.getAll().subscribe(res => {
      console.log('All items:', res);
      this.EnvironmentArray = res;
    });
  }
 
  onAdd() {
        // להחליף לדאטה רלוונטי
      
  }

  onUpdate() {
    this.EnvironmentService.update(this.environment).subscribe(res => {
     
    });
  }

  onDelete(id: number) {
    // מזהה קיים
    this.EnvironmentService.delete(id).subscribe(res => {
      console.log('Deleted:', res);
    });
  }
}
