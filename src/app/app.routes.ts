import { Routes } from '@angular/router';
import { EmployeeLogin } from './jobseeker/employee-login/employee-login';
import { EmployeeDashboard } from './jobseeker/employee-dashboard/employee-dashboard';
import { EmployerDashboard } from './Recruiter/employer-dashboard/employer-dashboard';
import { BrowseJobs } from './jobseeker/browse-jobs/browse-jobs';
import { MyApplications } from './jobseeker/my-applications/my-applications';
import { EmployeeProfile } from './jobseeker/employee-profile/employee-profile';
import { PostVacancy } from './Recruiter/post-vacancy/post-vacancy';
import { MyVacancies } from './Recruiter/my-vacancies/my-vacancies';
import { VacancyApplicants } from './Recruiter/vacancy-applicants/vacancy-applicants';
import { EmployerInterviews } from './Recruiter/employer-interviews/employer-interviews';
import { CompanyProfile } from './Recruiter/company-profile/company-profile';
import { EmployerSettings } from './Recruiter/employer-settings/employer-settings';
import { CompleteRegistration } from './auth/complete-registration/complete-registration';
import { CompanySetup } from './auth/company-setup/company-setup';
import { recruiterCompanyGuard } from './auth/recruiter-company.guard';
import { recruiterOnlyGuard } from './auth/recruiter-only.guard';

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
        path: 'complete-registration',
        component: CompleteRegistration
    },
    {
        path: 'company-setup',
        component: CompanySetup,
        canActivate: [recruiterOnlyGuard]
    },
    {
        path: 'employer-dashboard',
        component: EmployerDashboard,
        canActivate: [recruiterCompanyGuard]
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
    },
    {
        path: 'post-vacancy',
        component: PostVacancy,
        canActivate: [recruiterCompanyGuard]
    },
    {
        path: 'my-vacancies',
        component: MyVacancies,
        canActivate: [recruiterCompanyGuard]
    },
    {
        path: 'applicants',
        component: VacancyApplicants,
        canActivate: [recruiterCompanyGuard]
    },
    {
        path: 'interviews',
        component: EmployerInterviews,
        canActivate: [recruiterCompanyGuard]
    },
    {
        path: 'company-profile',
        component: CompanyProfile,
        canActivate: [recruiterCompanyGuard]
    },
    {
        path: 'settings',
        component: EmployerSettings,
        canActivate: [recruiterCompanyGuard]
    }
];
