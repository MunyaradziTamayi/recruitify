import { Routes } from '@angular/router';
import { EmployeeLogin } from './jobseeker/employee-login/employee-login';
import { EmployeeDashboard } from './jobseeker/employee-dashboard/employee-dashboard';
import { EmployerDashboard } from './Recruiter/employer-dashboard/employer-dashboard';
import { BrowseJobs } from './jobseeker/browse-jobs/browse-jobs';
import { MyApplications } from './jobseeker/my-applications/my-applications';
import { EmployeeProfile } from './jobseeker/employee-profile/employee-profile';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'employee-login',
        pathMatch: 'full'
    },
    {
        path: 'employee-login',
        component: EmployeeLogin
    },
    {
        path: 'employee-dashboard',
        component: EmployeeDashboard
    },
    {
        path: 'employer-dashboard',
        component: EmployerDashboard
    },
    {
        path: 'browse-jobs',
        component: BrowseJobs
    },
    {
        path: 'my-applications',
        component: MyApplications
    },
    {
        path: 'employee-profile',
        component: EmployeeProfile
    }
];
