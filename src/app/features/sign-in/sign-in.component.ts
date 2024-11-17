import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SignInComponent {
  signInForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);

  constructor(private fb: FormBuilder) {
    // Initialize the form group with validation
    this.signInForm = this.fb.group({
      username: ['', Validators.required],
      token: ['', Validators.required],
    });
  }

  // OAuth Login
  signInWithOAuth() {
    // Redirect to GitHub OAuth authorization URL
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=MY_CLIENT_ID&scope=repo,user';
  }

  // Manual PAT Login
  signInWithPAT() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { username, token } = this.signInForm.value;
    this.authService.authenticate(username, token).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // Redirect to dashboard after successful sign-in
      },
      error: (err) => {
        console.error('Sign-In Failed', err);
        alert('Invalid PAT or Authentication Failed');
      },
    });
  }
}
