import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { GithubUser } from '../../core/services/auth.service';
import { AuthService } from '../../core/services/auth.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'https://api.github.com';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('No token found');
    return new HttpHeaders({ Authorization: `token ${token}` });
  }

  // Fetch repositories for a given user
  getUserRepos(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${username}/repos`, {
      headers: this.getAuthHeaders(),
    }).pipe(catchError(this.handleError));
  }

  // Fetch commit activity for a given repository
  getRepoCommitActivity(owner: string, repo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/repos/${owner}/${repo}/stats/commit_activity`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map(response => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Fetch languages used in a given repository
  getRepoLanguages(owner: string, repo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/repos/${owner}/${repo}/languages`, {
      headers: this.getAuthHeaders(),
    }).pipe(catchError(this.handleError));
  }

  getUserData(username: string): Observable<GithubUser> {
    return this.authService.fetchUserData();
  }

  // Fetch user summary (number of repos, followers, following)
  getUserSummary(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${username}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((data) => ({
        repos: data.total_private_repos,
        followers: data.followers,
        following: data.following,
      })),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error occurred', error);
    return throwError(() => new Error(error));
  }
}
