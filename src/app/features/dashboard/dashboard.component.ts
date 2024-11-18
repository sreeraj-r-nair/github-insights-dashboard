import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { AuthService, GithubUser } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { interval, Subscription, Observable, forkJoin } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CommitFrequencyChartComponent } from '../dashboard/commit-frequency-chart/commit-frequency-chart.component';
import { LanguagesUsedChartComponent } from '../dashboard/languages-used-chart/languages-used-chart.component';
import { SummaryTileComponent } from '../dashboard/summary-tile/summary-tile.component';
import { TegelModule } from '@scania/tegel-angular-17';

interface Repo {
  name: string;
}

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
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const username = this.authService.getUsername();

    if (!username) {
      console.error('No username found, please authenticate first');
      this.loading.set(false);
      return;
    }

    this.fetchData(username).subscribe(); // Fetch data on load

    // Set up periodic refresh every 15 minutes
    const refreshInterval = interval(900000);
    const refreshSubscription = refreshInterval.pipe(
      switchMap(() => this.fetchData(username))
    ).subscribe();

    this.subscriptions.add(refreshSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private fetchData(username: string): Observable<void> {
    this.loading.set(true);

    const userData$ = this.dashboardService.getUserData(username).pipe(
      tap({
        next: (data: GithubUser) => this.user.set(data),
        error: (err) => console.error('Error fetching user data:', err),
      })
    );

    const userSummary$ = this.dashboardService.getUserSummary(username).pipe(
      tap({
        next: (data: any) => (this.summaryData = data),
        error: (err) => console.error('Error fetching user summary:', err),
      })
    );

    const repos$ = this.dashboardService.getUserRepos(username).pipe(
      switchMap((repos: Repo[]) => {
        const commitRequests = repos.map((repo: Repo) =>
          this.dashboardService.getRepoCommitActivity(username, repo.name)
        );
        const languageRequests = repos.map((repo: Repo) =>
          this.dashboardService.getRepoLanguages(username, repo.name)
        );

        return forkJoin([
          forkJoin(commitRequests).pipe(
            tap({
              next: (commitActivities: any[]) => (this.commitFrequencyData = commitActivities),
              error: (err) => console.error('Error fetching commit activities:', err),
            })
          ),
          forkJoin(languageRequests).pipe(
            tap({
              next: (languagesArray: any[]) => (this.languagesData = languagesArray),
              error: (err) => console.error('Error fetching languages data:', err),
            })
          ),
        ]);
      })
    );

    return forkJoin([userData$, userSummary$, repos$]).pipe(
      tap({
        next: () => this.loading.set(false),
        error: (err) => {
          console.error('Error fetching data:', err);
          this.loading.set(false);
        },
      }),
      map(() => void 0)
    );
  }
}
