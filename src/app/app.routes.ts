import { Routes } from '@angular/router';
import { EmployeeDashboard } from './jobseeker/employee-dashboard/employee-dashboard';
import { EmployerDashboard } from './Recruiter/employer-dashboard/employer-dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'employee-dashboard',
        pathMatch: 'full'
    },
    {
        path: 'employee-dashboard',
        component: EmployeeDashboard
    },
    {
        path: 'employer-dashboard',
        component: EmployerDashboard
    }
];
