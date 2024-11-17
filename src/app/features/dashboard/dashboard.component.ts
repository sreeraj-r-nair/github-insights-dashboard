import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { AuthService, GithubUser } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CommitFrequencyChartComponent } from '../dashboard/commit-frequency-chart/commit-frequency-chart.component';
import { LanguagesUsedChartComponent } from '../dashboard/languages-used-chart/languages-used-chart.component';
import { SummaryTileComponent } from '../dashboard/summary-tile/summary-tile.component';
import { TegelModule } from '@scania/tegel-angular-17';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TegelModule, SpinnerComponent, CommitFrequencyChartComponent, LanguagesUsedChartComponent, SummaryTileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user = signal<GithubUser | null>(null);
  loading = signal<boolean>(true);
  commitFrequencyData: any[] = [];
  languagesData: any[] = [];
  summaryData: any = {};

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

    this.dashboardService.getUserData(username).subscribe({
      next: (data: GithubUser) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error fetching user data:', err);
        this.loading.set(false);
      }
    });

    this.dashboardService.getUserSummary(username).subscribe({
      next: (data: any) => {
        this.summaryData = data;
      },
      error: (err: any) => {
        console.error('Error fetching user summary:', err);
      },
    });
    console.log(this.summaryData);

    this.dashboardService.getUserRepos(username).subscribe({
      next: (repos: any[]) => {
        repos.forEach((repo) => {
          this.dashboardService.getRepoCommitActivity(username, repo.name).subscribe({
            next: (data: any) => {
              console.log('Commit Activity for Repo:', repo.name, data);
              this.commitFrequencyData.push(data);
            },
            error: (err: any) => {
              console.error('Error fetching commit activity:', err);
            },
          });

          this.dashboardService.getRepoLanguages(username, repo.name).subscribe({
            next: (data: any) => {
              this.languagesData.push(data);
            },
            error: (err: any) => {
              console.error('Error fetching repository languages:', err);
            },
          });
        });
      },
      error: (err: any) => {
        console.error('Error fetching user repositories:', err);
      },
    });
  }
}
