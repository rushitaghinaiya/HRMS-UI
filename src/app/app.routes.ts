import { Routes } from '@angular/router';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { LoginComponent } from './Pages/login/login.component';

export const routes: Routes = [
     { path: '', component: LoginComponent },
     { path: 'dashboard', component: DashboardComponent },

];
