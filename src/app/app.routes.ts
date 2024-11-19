import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CommitListComponent } from './features/commit-list/commit-list.component';
import { AuthGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: 'sign-in', component: SignInComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'commit-list', component: CommitListComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' }, // Redirect to sign-in by default
  { path: '**', redirectTo: '/sign-in' } // Catch-all route to handle undefined routes
];
