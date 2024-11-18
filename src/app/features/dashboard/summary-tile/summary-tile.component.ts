import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-tile',
  standalone: true,
  templateUrl: './summary-tile.component.html',
  styleUrls: ['./summary-tile.component.css'],
  providers: [CookieService],
  imports: [CommonModule], 
})
export class SummaryTileComponent implements OnInit {
  // Define the properties that will be used to display the summary information
  public projectCount: number = 0;
  public followers: number = 0;
  public following: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    // Retrieve the username from the cookies
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found in cookies, please authenticate first');
      return;
    }

    // Fetch the summary information for the user
    this.dashboardService.getUserSummary(username).subscribe({
      next: (data) => {
        // Set the values returned by the service to display in the template
        this.projectCount = data.repos;
        this.followers = data.followers;
        this.following = data.following;
      },
      error: (err) => {
        console.error('Error fetching user summary data:', err);
      }
    });
  }
}
