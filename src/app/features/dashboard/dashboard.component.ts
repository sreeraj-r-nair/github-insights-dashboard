import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TegelModule } from '@scania/tegel-angular-17';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TegelModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: WritableSignal<any> = signal(null);
  loading: WritableSignal<boolean> = signal(true);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/sign-in']); // Navigate to the sign-in page if no token
      return;
    }

    const username = this.authService.username(); // Get the stored username

    if (username) {
      // Fetch user data after authentication
      this.authService.getUserData(username).subscribe({
        next: (data) => {
          this.user.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
          this.loading.set(false);
        },
      });
    } else {
      console.error('Username is null');
      this.loading.set(false);
    }
  }
}
