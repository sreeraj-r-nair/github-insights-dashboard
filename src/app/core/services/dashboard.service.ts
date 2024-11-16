import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  // Helper to create HTTP headers with token
  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `token ${token}` });
  }

  // Method to fetch user data from GitHub API
  getUserData(token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.get('https://api.github.com/user', { headers });
  }
}
