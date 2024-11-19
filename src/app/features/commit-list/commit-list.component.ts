import { Component, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DatepickerComponent } from '../../shared/components/date-picker/datepicker.component';

export interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    } | null;  // committer can be null
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
  };
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
  };
  committer: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
  };
  parents: {
    sha: string;
    url: string;
    html_url: string;
  }[];
}

@Component({
  selector: 'app-commit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    ButtonComponent,
    DatepickerComponent
  ],
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.css'],
})
export class CommitListComponent implements OnInit {
  commits = signal<Commit[]>([]);
  filteredCommits = signal<Commit[]>([]);
  searchTerm = signal<string>('');
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(private dashboardService: DashboardService, private cookieService: CookieService,) {}

  ngOnInit(): void {
    const username = this.cookieService.get('github_username');

    if (!username) {
      console.error('No username found, please authenticate first');
      return;
    }

    this.dashboardService.getUserRepos(username).subscribe({
      next: (repos) => {
        const allCommits: Commit[] = [];
        repos.forEach((repo: any) => {
          this.dashboardService.getRepoCommits(repo.owner.login, repo.name).subscribe({
            next: (commits) => {
              allCommits.push(...commits);
              this.commits.set(allCommits);
              this.sortCommits(allCommits); // Sort commits by date descending
              this.filterCommits();  // Apply search filter
            },
            error: (err) => {
              console.error(`Failed to load commits for repo ${repo.name}`, err);
            },
          });
        });
      },
      error: (err) => {
        console.error('Failed to load repositories', err);
      },
    });
  }

  sortCommits(commits: Commit[]): void {
    this.commits.set(commits.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()));
  }

  filterCommits(): void {
    let filtered = this.commits();
  
    // Filter by search term
    const term = this.searchTerm();
    if (term) {
      filtered = filtered.filter(commit =>
        commit.commit.message.toLowerCase().includes(term.toLowerCase())
      );
    }
  
    // Filter by date range
    if (this.startDate) {
      filtered = filtered.filter(commit => new Date(commit.commit.author.date) >= (this.startDate ?? new Date(0)));
    }
  
    if (this.endDate) {
      filtered = filtered.filter(commit => new Date(commit.commit.author.date) <= (this.endDate ?? new Date()));
    }
  
    // Sort commits in descending order by date after filtering
    filtered = filtered.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime());
  
    this.filteredCommits.set(filtered);
  }
  

    // The new method to clear the date filters
    clearDateFilters() {
      this.startDate = null;
      this.endDate = null;
      this.filterCommits();
    }
  

  // Calculate time ago function for displaying relative time
  calculateTimeAgo(commitDate: string): string {
    const commitTime = new Date(commitDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - commitTime.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day(s) ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour(s) ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute(s) ago`;
    } else {
      return `${diffInSeconds} second(s) ago`;
    }
  }

  searchCommits(): void {
    this.filterCommits();
  }

  openCommitDetails(url: string): void {
    window.open(url, '_blank');
  }
}
