import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { FilesPageComponent } from './files-page.component';
import { EnvironmentsComponent } from './components/environments/environments.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'files', component: FilesPageComponent },
  { path: 'environments', component: EnvironmentsComponent },
  { path: '**', redirectTo: '' }
];
