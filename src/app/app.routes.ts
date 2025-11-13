import { Routes } from '@angular/router';
import { FilesListComponent } from './pages/files-list/files-list.component';
import { AddFilePageComponent } from './pages/add-file/add-file-page.component';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CaptureComponent } from './components/capture/capture.component';
import { ViewControlComponent } from './components/view-control/view-control.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [

  { path: 'dashboard', component: DashboardComponent },
  { path: '', component:  LoginComponent},

  { path: 'files', component: FilesListComponent },
  { path: 'add-file', component: AddFilePageComponent },
  { path: 'environments', component: EnvironmentsComponent },
    { path: 'view-control', component: ViewControlComponent },
    { path: 'capture', component: CaptureComponent },


  { path: '**', redirectTo: '' }
];
