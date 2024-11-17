import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

// Interface for GitHub user data
export interface GithubUser {
  login: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: WritableSignal<string | null> = signal(null);
  isAuthenticated = signal<boolean>(false);
  user = signal<GithubUser | null>(null);
  username = signal<string | null>(null);

  constructor(private http: HttpClient, private cookieService: CookieService) {
    const token = this.getCookie('github_token');
    const username = this.getCookie('github_username');
    if (token && username) {
      this.token.set(token);
      this.username.set(username);
      this.isAuthenticated.set(true);
      this.fetchUserData().subscribe(); // Ensure user data is fetched if a token exists
    }
  }

  private getCookie(key: string, isJson: boolean = false): any {
    const storedValue = this.cookieService.get(key);
    if (!storedValue) return null;

    if (isJson) {
      try {
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing ${key} from cookie:`, error);
        return null;
      }
    }

    return storedValue;
  }

  private setCookie(key: string, value: any): void {
    const options = { expires: 1, secure: true, sameSite: 'Strict' as 'Strict' };
    if (value !== null && typeof value === 'object') {
      this.cookieService.set(key, JSON.stringify(value), options);
    } else {
      this.cookieService.set(key, value, options);
    }
  }

  private removeCookie(key: string): void {
    this.cookieService.delete(key, '/', 'Strict');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) throw new Error('No token found');
    return new HttpHeaders({ Authorization: `token ${token}` });
  }

  getToken(): string | null {
    return this.token();
  }

  getUsername(): string | null {
    return this.username();
  }

  authenticate(username: string, token: string): Observable<boolean> {
    if (!this.isTokenValid(token)) {
      return throwError(() => new Error('Invalid token format'));
    }

    const headers = new HttpHeaders({ Authorization: `token ${token}` });
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`, { headers }).pipe(
      map((data: GithubUser) => {
        this.token.set(token);
        this.username.set(username);
        this.setCookie('github_token', token);
        this.setCookie('github_username', username);
        this.isAuthenticated.set(true);
        this.user.set(data);
        this.setCookie('github_user', data);
        return true;
      }),
      catchError((err) => this.handleError(err, 'Authentication error'))
    );
  }

  authenticateWithOAuth(token: string): void {
    if (!this.isTokenValid(token)) throw new Error('Invalid OAuth token format');
    this.token.set(token);
    this.setCookie('github_token', token);
    this.isAuthenticated.set(true);
    this.fetchUserData().subscribe(); // Re-fetch user data after authentication
  }

  logout(): void {
    this.token.set(null);
    this.username.set(null);
    this.removeCookie('github_token');
    this.removeCookie('github_username');
    this.isAuthenticated.set(false);
    this.user.set(null);
    this.removeCookie('github_user');
  }

  fetchUserData(): Observable<GithubUser | null> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token found'));

    return this.http.get<GithubUser>(`https://api.github.com/user`, { headers: this.getAuthHeaders() }).pipe(
      map((data: GithubUser) => {
        this.user.set(data);
        this.setCookie('github_user', data);
        return data;
      }),
      catchError((error) => {
        if (error.status === 401) {
          console.log('Token expired or invalid. Logging out...');
          this.logout();  // Call logout to clear invalid token
          return throwError(() => new Error('Token expired, please log in again'));
        }
        return this.handleError(error, 'Error fetching user data');
      })
    );
  }

  getUserData(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((err) => this.handleError(err, 'Error fetching user data'))
    );
  }

  private isTokenValid(token: string): boolean {
    return /^[a-zA-Z0-9_-]{40}$/.test(token); // Basic PAT token format validation
  }

  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
    const errorMessage = error.error?.message || `An error occurred during ${context}`;
    if (error.status === 401) {
      console.log('Token expired or invalid. Logging out...');
      this.logout();  // Call logout to clear invalid token
      return throwError(() => new Error('Token expired, please log in again'));
    } else if (error.status === 404) {
      console.error(`${context}: Not Found - ${errorMessage}`);
    } else if (error.status === 500) {
      console.error(`${context}: Server Error - ${errorMessage}`);
    } else {
      console.error(`${context}: ${errorMessage}`);
    }
    return throwError(() => new Error(errorMessage));
  }
}
