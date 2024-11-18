import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { AuthService, GithubUser } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { Subscription  } from 'rxjs';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CommitFrequencyChartComponent } from '../dashboard/commit-frequency-chart/commit-frequency-chart.component';
import { LanguagesUsedChartComponent } from '../dashboard/languages-used-chart/languages-used-chart.component';
import { SummaryTileComponent } from '../dashboard/summary-tile/summary-tile.component';
import { TegelModule } from '@scania/tegel-angular-17';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TegelModule, SpinnerComponent, CommitFrequencyChartComponent, LanguagesUsedChartComponent, SummaryTileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user = signal<GithubUser | null>(null);
  loading = signal<boolean>(true);
  commitFrequencyData: any[] = [];
  languagesData: any[] = [];
  summaryData: any = {};
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/sign-in']);
      return;
    }

    const username = this.authService.getUsername();
    if (!username) {
      console.error('No username found, please authenticate first');
      this.loading.set(false);
      return;
    }

    this.dashboardService.getUserData(username).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.user.set(null);
        this.loading.set(false);
      }
    });

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
