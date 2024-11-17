import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CookieService } from 'ngx-cookie-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-languages-used-chart',
  standalone: true,
  templateUrl: './languages-used-chart.component.html',
  styleUrls: ['./languages-used-chart.component.css'],
  imports: [NgxChartsModule]
})
export class LanguagesUsedChartComponent implements OnInit {
  public doughnutChartOptions: any = {
    showLabels: true,
    explodeSlices: false,
    doughnut: true,
    colorScheme: {
      domain: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1'] // Colors for each slice
    }
  };

  // Data to display in the chart
  public languagesData: any[] = [];
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
}
