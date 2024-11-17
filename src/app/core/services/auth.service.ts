import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface for GitHub user data
interface GithubUser {
  login: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Reactive signals for token, authentication state, user data, and username
  private token: WritableSignal<string | null> = signal(this.getLocalStorage('github_token'));
  isAuthenticated = signal<boolean>(!!this.token());
  user = signal<GithubUser | null>(this.getLocalStorage('github_user'));
  username = signal<string | null>(this.getLocalStorage('github_username'));

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token && !this.user()) {
      this.fetchUserData();
    }
  }

  /**
   * Helper function to check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper function to get an item from localStorage
   */
  private getLocalStorage(key: string): any {
    const storedValue = localStorage.getItem(key);
  
    if (!storedValue) {
      return null;
    }
  
    if (key === 'github_token') {
      return storedValue;
    }
  
    try {
      return JSON.parse(storedValue);
    } catch (error) {
      console.error(`Error parsing ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Helper function to set an item in localStorage
   */
  private setLocalStorage(key: string, value: any): void {
    if (value !== null && typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Helper function to remove an item from localStorage
   */
  private removeLocalStorage(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Create authorization headers using the stored token.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({ Authorization: `token ${token}` });
  }

  /**
   * Get the current token as a signal value.
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Authenticate user with GitHub username and token.
   * Updates signals on success.
   */
  authenticate(username: string, token: string): Observable<boolean> {
    if (!this.isTokenValid(token)) {
      return throwError(() => new Error('Invalid token format'));
    }

    const headers = new HttpHeaders({ Authorization: `token ${token}` });
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`, { headers }).pipe(
      map((data: GithubUser) => {
        this.token.set(token);
        this.setLocalStorage('github_token', token);
        this.isAuthenticated.set(true);
        this.user.set(data);
        this.username.set(data.login);
        this.setLocalStorage('github_user', data);
        this.setLocalStorage('github_username', data.login);
        return true;
      }),
      catchError((err) => {
        const errorMessage = err.error.message || 'Invalid token';
        console.error('Authentication error:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );    
  }

  /**
   * Authenticate user with OAuth token.
   * Updates signals on success.
   */
  authenticateWithOAuth(token: string): void {
    if (!this.isTokenValid(token)) {
      throw new Error('Invalid OAuth token format');
    }

    this.token.set(token);
    this.setLocalStorage('github_token', token);
    this.isAuthenticated.set(true);
    this.fetchUserData();
  }

  /**
   * Log out the user, clear the token, and update the authentication state.
   */
  logout(): void {
    this.token.set(null);
    this.removeLocalStorage('github_token');
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.username.set(null);
    this.removeLocalStorage('github_user');
    this.removeLocalStorage('github_username');
  }

  /**
   * Fetch user data and update the user signal.
   */
  fetchUserData(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }
    this.http.get<GithubUser>(`https://api.github.com/user`, { headers: this.getAuthHeaders() }).subscribe(
      (data: GithubUser) => {
        this.user.set(data);
        this.username.set(data.login);
        localStorage.setItem('github_user', JSON.stringify(data));
        localStorage.setItem('github_username', data.login);
      },
      (error) => {
        console.error('Error fetching user data', error);
        this.user.set(null);
      }
    );
    
  }

  /**
   * Fetch user data from GitHub API.
   */
  getUserData(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        const errorMessage = err.error.message || 'Error fetching user data';
        console.error('Error fetching user data', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Fetch user repositories from GitHub API.
   */
  getUserRepos(username: string): Observable<any> {
    return this.http.get(`https://api.github.com/users/${username}/repos`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        const errorMessage = err.error.message || 'Error fetching user repositories';
        console.error('Error fetching user repositories', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Fetch repository commit activity from GitHub API.
   */
  getRepoCommitActivity(owner: string, repo: string): Observable<any> {
    return this.http.get(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        const errorMessage = err.error.message || 'Error fetching commit activity';
        console.error('Error fetching commit activity', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Fetch repository languages from GitHub API.
   */
  getRepoLanguages(owner: string, repo: string): Observable<any> {
    return this.http.get(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        const errorMessage = err.error.message || 'Error fetching repository languages';
        console.error('Error fetching repository languages', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Fetch repository commits from GitHub API.
   */
  getRepoCommits(owner: string, repo: string): Observable<any> {
    return this.http.get(`https://api.github.com/repos/${owner}/${repo}/commits`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => {
        const errorMessage = err.error.message || 'Error fetching repository commits';
        console.error('Error fetching repository commits', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Validate the format of the token.
   */
  private isTokenValid(token: string): boolean {
    return /^[a-zA-Z0-9_-]{40}$/.test(token); // Simple validation for PAT format
  }
}
