import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-summary-tile',
  standalone: true,
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.css'],
  providers: [CookieService],
  imports: [CommonModule], 
})
export class SummaryTileComponent implements OnInit {
  public projectCount: number = 0;
  public followers: number = 0;
  public following: number = 0;
  public totalCommits: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private cookieService: CookieService,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit(): void {
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found in cookies, please authenticate first');
      return;
    }

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

    // Subscribe to total commits from the shared service
    this.sharedDataService.totalCommits$.subscribe(totalCommits => {
      this.totalCommits = totalCommits;
    });
  }
}
