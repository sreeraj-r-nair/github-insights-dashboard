import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { AutoRefreshService } from '../../../core/services/auto-refresh.service'; // Import AutoRefreshService
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-summary-tile',
  standalone: true,
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.css'],
  providers: [CookieService],
  imports: [CommonModule], 
})
export class SummaryTileComponent implements OnInit, OnDestroy {
  public projectCount: number = 0;
  public followers: number = 0;
  public following: number = 0;
  public totalCommits: number = 0;

  private refreshSubscription: Subscription = new Subscription(); // Subscription for auto-refresh
  private totalCommitsSubscription: Subscription = new Subscription(); // Subscription for totalCommits

  constructor(
    private dashboardService: DashboardService,
    private cookieService: CookieService,
    private sharedDataService: SharedDataService,
    private autoRefreshService: AutoRefreshService // Inject AutoRefreshService
  ) {}

  ngOnInit(): void {
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found in cookies, please authenticate first');
      return;
    }

    // Fetch initial summary data
    this.fetchUserSummary(username);

    // Subscribe to auto-refresh events from AutoRefreshService
    this.refreshSubscription = this.autoRefreshService.refresh$.subscribe(() => {
      this.refreshData(username); // Trigger data refresh when auto-refresh event is emitted
    });

    // Subscribe to total commits from the shared service to keep it updated
    this.totalCommitsSubscription = this.sharedDataService.totalCommits$.subscribe(totalCommits => {
      this.totalCommits = totalCommits;
    });
  }

  private refreshData(username: string): void {
    // Re-fetch the user summary and total commits data
    this.fetchUserSummary(username);
  }

  private fetchUserSummary(username: string): void {
    this.dashboardService.getUserSummary(username).subscribe({
      next: (data) => {
        this.projectCount = data.repos;
        this.followers = data.followers;
        this.following = data.following;
      },
      error: (err) => {
        console.error('Error fetching user summary data:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    this.totalCommitsSubscription.unsubscribe(); // Unsubscribe from the total commits observable
  }
}
