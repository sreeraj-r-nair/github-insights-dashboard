import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { BarChartComponent } from '../../../shared/components/chart/bar-chart.component';
import { forkJoin } from 'rxjs';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-commit-frequency-chart',
  standalone: true,
  templateUrl: './commit-frequency-chart.component.html',
  styleUrls: ['./commit-frequency-chart.component.css'],
  imports: [CommonModule, BarChartComponent]
})
export class CommitFrequencyChartComponent implements OnInit {

  public barChartData: any[] = [];
  public chartLabels: string[] = [];
  public noDataMessage: string | null = null;
  public loading: boolean = false;
  public totalCommits: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private sharedDataService: SharedDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const username = this.cookieService.get('github_username');

    if (!username) {
      this.handleError('No username found, please authenticate first');
      return;
    }

    this.authService.fetchUserData().subscribe({
      next: (user) => {
        this.loading = false;
        // Additional logic to handle user data
      },
      error: (err) => {
        this.loading = false;
        this.noDataMessage = 'Failed to load user data';
      }
    });

    this.fetchRepos(username);
  }

  private fetchRepos(username: string): void {
    this.dashboardService.getUserRepos(username).subscribe({
      next: (repos: any[]) => {
        if (!repos || repos.length === 0) {
          this.handleError('No repositories found.');
          return;
        }
        this.fetchCommitData(username, repos);
      },
      error: (err) => {
        console.error('Error fetching user repositories:', err);
        this.handleError('Error fetching repositories data.');
      }
    });
  }

  private fetchCommitData(username: string, repos: any[]): void {
    const commitRequests = repos.map(repo => 
      this.dashboardService.getRepoCommitActivity(username, repo.name)
    );

    forkJoin(commitRequests).subscribe({
      next: (commitActivities: any[]) => {
        this.processCommitActivities(commitActivities, repos);
      },
      error: (err) => {
        console.error('Error fetching commit activity:', err);
        this.handleError('Error fetching commit activity data.');
      }
    });
  }

  private processCommitActivities(commitActivities: any[], repos: any[]): void {
    let monthlyCommits = new Map<string, number>(); // Map to store monthly commit totals
    let totalCommits = 0;

    // Initialize all months in the current year with a commit count of 0
    const currentYear = new Date().getFullYear();
    const monthsOfYear = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    monthsOfYear.forEach(month => {
      const monthYear = `${month} ${currentYear}`;
      monthlyCommits.set(monthYear, 0);  // Set all months to zero initially
    });  

    commitActivities.forEach((data, index) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`No commit activity data for repo: ${repos[index].name}`);
        return;
      }

      data.forEach((weekData: any) => {
        if (weekData.total > 0) {
          const date = new Date(weekData.week * 1000);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const monthYear = `${month} ${year}`;

          // Only update if the data is for the current year
          if (year === currentYear) {
            const currentValue = monthlyCommits.get(monthYear) || 0;
            monthlyCommits.set(monthYear, currentValue + weekData.total);
            totalCommits += weekData.total;
          }
        }
      });
    });

    this.totalCommits = totalCommits;
    this.sharedDataService.setTotalCommits(totalCommits); // Emit the total commits to the shared service
    this.updateBarChartData(monthlyCommits);
  }

  private updateBarChartData(monthlyCommits: Map<string, number>): void {
    // Convert the map to an array for bar chart data
    this.barChartData = Array.from(monthlyCommits, ([name, value]) => ({ name, value }));
    this.chartLabels = this.barChartData.map((item) => item.name);

    if (this.barChartData.length === 0) {
      this.noDataMessage = 'No commit activity data available.';
    } else {
      this.noDataMessage = null;  // Clear the message if data exists
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  private handleError(message: string): void {
    this.noDataMessage = message;
    this.loading = false;
    this.cdr.detectChanges();
  }
}
