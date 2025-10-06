import { Routes } from '@angular/router';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { LoginComponent } from './Pages/login/login.component';
import { AdminDashboardComponent } from './Pages/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
     { path: '', component: LoginComponent },
     { path: 'dashboard', component: DashboardComponent },
     { path: 'admindashboard', component: AdminDashboardComponent },


];
