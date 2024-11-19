import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PieChartComponent } from '../../../shared/components/chart/pie-chart.component';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin, Subscription } from 'rxjs';
import { AutoRefreshService } from '../../../core/services/auto-refresh.service'; // Import AutoRefreshService

@Component({
  selector: 'app-languages-used-chart',
  standalone: true,
  templateUrl: './languages-used-chart.component.html',
  styleUrls: ['./languages-used-chart.component.css'],
  imports: [CommonModule, PieChartComponent]
})
export class LanguagesUsedChartComponent implements OnInit, OnDestroy {
  // Data to display in the chart
  public languagesData: any[] = [];
  public chartData: any[] = [];
  public chartLabels: string[] = [];
  public noDataMessage: string | null = null;

  private refreshSubscription: Subscription = new Subscription(); // Subscription for auto-refresh

  constructor(
    private dashboardService: DashboardService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private autoRefreshService: AutoRefreshService // Inject AutoRefreshService
  ) {}

  ngOnInit(): void {
    // Retrieve the username from the cookies
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found, please authenticate first');
      this.noDataMessage = 'Please authenticate to view data.';
      return;
    }

    // Fetch initial data
    this.fetchLanguageData(username);

    // Subscribe to auto-refresh events from AutoRefreshService
    this.refreshSubscription = this.autoRefreshService.refresh$.subscribe(() => {
      this.refreshData(username); // Trigger data refresh when auto-refresh event is emitted
    });
  }

  private refreshData(username: string): void {
    // Re-fetch the language data for the user
    this.fetchLanguageData(username);
  }

  private fetchLanguageData(username: string): void {
    this.dashboardService.getUserRepos(username).subscribe({
      next: (repos: any[]) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          console.warn('No repositories found for the user.');
          this.noDataMessage = 'No repositories found.';
          return;
        }

        const languageCounts: { [key: string]: number } = {};

        // Create an array of observables for fetching languages for each repository
        const languageRequests = repos.map(repo =>
          this.dashboardService.getRepoLanguages(username, repo.name)
        );

        // Use forkJoin to wait for all language requests to complete
        forkJoin(languageRequests).subscribe({
          next: (languagesArray: any[]) => {
            languagesArray.forEach((data, index) => {
              if (Object.keys(data).length === 0) {
                console.warn(`No language data for repo: ${repos[index].name}`);
                return; // Skip if no languages are found for this repo
              }

              Object.keys(data).forEach((language) => {
                if (languageCounts[language]) {
                  languageCounts[language] += data[language];
                } else {
                  languageCounts[language] = data[language];
                }
              });
            });

            this.languagesData = Object.keys(languageCounts).map((language) => ({
              name: language,
              value: languageCounts[language]
            }));

            // Check if there is data to display
            if (this.languagesData.length === 0) {
              this.noDataMessage = 'No languages data available.';
            } else {
              this.chartData = this.languagesData.map(item => item.value);
              this.chartLabels = this.languagesData.map(item => item.name);
              this.noDataMessage = null;  // Clear the message if data exists
            }

            // Trigger change detection to update the chart
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error fetching repository languages:', err);
            this.noDataMessage = 'Error fetching languages data.';
          }
        });
      },
      error: (err: any) => {
        console.error('Error fetching user repositories:', err);
        this.noDataMessage = 'Error fetching repositories data.';
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
  }
}
