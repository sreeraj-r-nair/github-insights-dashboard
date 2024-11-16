import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string | null = null;
  isAuthenticated = signal<boolean>(false); // Tracks authentication state

  constructor(private http: HttpClient) {}

  authenticate(username: string, token: string): Observable<boolean> {
    const headers = new HttpHeaders({ Authorization: `token ${token}` });

    return this.http.get(`https://api.github.com/users/${username}`, { headers }).pipe(
      map(() => {
        this.token = token;
        localStorage.setItem('github_token', token);
        this.isAuthenticated.set(true);
        console.log('User authenticated successfully');
        return true;
      }),
      catchError((err) => {
        console.error('Authentication failed', err);
        return throwError(() => new Error(err.error.message || 'Invalid token'));
      })
    );
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('github_token');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('github_token');
    this.isAuthenticated.set(false);
    console.log('User logged out');
  }
}
