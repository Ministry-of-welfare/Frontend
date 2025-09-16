import { Routes } from '@angular/router';
import { FilesListComponent } from './pages/files-list/files-list.component';
import { AddFilePageComponent } from './pages/add-file/add-file-page.component';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'files', component: FilesListComponent },
  { path: 'add-file', component: AddFilePageComponent },
  { path: 'environments', component: EnvironmentsComponent },
  { path: '**', redirectTo: '' }
];
