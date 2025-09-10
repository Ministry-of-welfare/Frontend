import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { FilesListComponent } from './pages/files-list/files-list.component';
import { AddFilePageComponent } from './pages/add-file/add-file-page.component';
import { EnvironmentsComponent } from './components/environments/environments.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'files', component: FilesListComponent },
  { path: 'add-file', component: AddFilePageComponent },
  { path: 'environments', component: EnvironmentsComponent },
  { path: '**', redirectTo: '' }
];
