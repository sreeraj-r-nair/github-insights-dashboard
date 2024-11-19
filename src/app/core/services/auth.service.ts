import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

// Interface for GitHub user data
export interface GithubUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: WritableSignal<string | null> = signal(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private userSignal = signal<GithubUser | null>(null);
  private usernameSignal = signal<string | null>(null);

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    const token = this.getCookie('github_token');
    const username = this.getCookie('github_username');
  
    if (token && username) {
      this.token.set(token);
      this.usernameSignal.set(username);
      this.isAuthenticatedSignal.set(true);
      this.fetchUserData().subscribe(); // Ensure user data is fetched if a valid token exists
    } else {
      // Clear stale cookies or invalid state
      this.clearState();
    }
  }

  private clearState(): void {
    this.token.set(null);
    this.usernameSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userSignal.set(null);
  
    this.removeCookie('github_token');
    this.removeCookie('github_username');
    this.removeCookie('github_user');
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

  private removeCookie(key: string): void {
    this.cookieService.delete(key);
  }

  authenticate(username: string, token: string): Observable<boolean> {
    this.token.set(token);
    this.usernameSignal.set(username);

    const headers = new HttpHeaders().set('Authorization', `token ${token}`);
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`, { headers }).pipe(
      map((user) => {
        this.userSignal.set(user);
        this.isAuthenticatedSignal.set(true);
        this.cookieService.set('github_token', token);
        this.cookieService.set('github_user', JSON.stringify(user));
        this.cookieService.set('github_username', username);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.clearState();
        return throwError(() => new Error('Invalid token format'));
      })
    );
  }

  fetchUserData(): Observable<GithubUser> {
    const token = this.token();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `token ${token}`);
    return this.http.get<GithubUser>('https://api.github.com/user', { headers }).pipe(
      map((user) => {
        this.userSignal.set(user);
        this.cookieService.set('github_user', JSON.stringify(user));
        return user;
      }),
      catchError((error: HttpErrorResponse) => {
        this.clearState();
        return throwError(() => new Error('Token expired, please log in again'));
      })
    );
  }

  logout(): void {
    this.clearState();
    this.router.navigate(['/signin']);
  }

  getToken(): string | null {
    return this.token();
  }

  getUsername(): string | null {
    return this.usernameSignal();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  getUser(): GithubUser | null {
    return this.userSignal();
  }
}
