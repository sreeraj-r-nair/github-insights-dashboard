import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-commit-frequency-chart',
  standalone: true,
  templateUrl: './commit-frequency-chart.component.html',
  styleUrls: ['./commit-frequency-chart.component.css'],
  imports: [NgxChartsModule]
})
export class CommitFrequencyChartComponent implements OnInit {
  public barChartOptions: any = {
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    showLegend: true,
    showXAxisLabel: true,
    xAxisLabel: 'Month',
    showYAxisLabel: true,
    yAxisLabel: 'Commits',
    colorScheme: {
      domain: ['#42A5F5']
    }
  };

  public barChartData: any[] = [];
  public noDataMessage: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cookieService: CookieService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Retrieve the username from the cookies
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found, please authenticate first');
      this.noDataMessage = 'Please authenticate to view data.';
      return;
    }

    // Fetch repositories for the user
    this.dashboardService.getUserRepos(username).subscribe({
      next: (repos: any[]) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          console.warn('No repositories found for the user.');
          this.noDataMessage = 'No repositories found.';
          return;
        }

        const monthlyCommits = new Map<string, number>();

        // Create an array of observables for fetching commit activity for each repository
        const commitRequests = repos.map(repo =>
          this.dashboardService.getRepoCommitActivity(username, repo.name)
        );

        // Use forkJoin to wait for all commit requests to complete
        forkJoin(commitRequests).subscribe({
          next: (commitActivities: any[]) => {
            commitActivities.forEach((data, index) => {
              console.log(`Commit activity for Sree: ${repos[index].name}`, data);
              if (!data || !data.weeks || !Array.isArray(data.weeks)) {
                console.warn(`No commit activity data for repo: ${repos[index].name}`);
                return; // Skip if no commit activity data is found for this repo
              }              
              console.log(`Commit activity for Repo: ${repos[index].name}`, data);

              // Aggregate weekly data to monthly data
              data.weeks.forEach((week: any) => {
                const date = new Date(week.week * 1000); // Convert Unix timestamp to Date object
                const month = date.toLocaleString('default', { month: 'short' });
                const year = date.getFullYear(); 
                const monthYear = `${month} ${year}`;

                // Add weekly commit data to the corresponding month
                const currentValue = monthlyCommits.get(monthYear) || 0;
                monthlyCommits.set(monthYear, currentValue + week.total);
              });
            });

            // Log the monthlyCommits map
            console.log('Monthly Commits:', monthlyCommits);

            // Convert the map to an array for bar chart data
            this.barChartData = Array.from(monthlyCommits, ([name, value]) => ({ name, value }));

            // Log the final barChartData
            console.log('Final barChartData:', this.barChartData);

            // Check if there is data to display
            if (this.barChartData.length === 0) {
              this.noDataMessage = 'No commit activity data available.';
            } else {
              this.noDataMessage = null;  // Clear the message if data exists
            }

            // Trigger change detection to update the chart
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error fetching commit activity:', err);
            this.noDataMessage = 'Error fetching commit activity data.';
          }
        });
      },
      error: (err: any) => {
        console.error('Error fetching user repositories:', err);
        this.noDataMessage = 'Error fetching repositories data.';
      }
    });
  }
}
