import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  constructor(private authService: AuthService) {}

  signIn(username: string, token: string): void {
    this.authService.authenticate(username, token).subscribe({
      next: () => {
        // Redirect to dashboard on successful login
      },
      error: (err) => {
        // Handle login error
        console.error(err);
      }
    });
  }
}
