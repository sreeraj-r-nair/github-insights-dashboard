import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
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
      username: ['', [Validators.required, this.noSpecialCharactersValidator]],
      token: ['', [Validators.required, this.githubTokenValidator]],
    });
  }

// Custom validator to check for special characters
noSpecialCharactersValidator(control: AbstractControl): { [key: string]: boolean } | null {
  // Allow alphanumeric characters and hyphen (-)
  const specialCharPattern = /[^a-zA-Z0-9-]/;
  if (specialCharPattern.test(control.value)) {
    return { 'specialChars': true };
  }
  return null;
}

  // Custom validator to check for valid GitHub PAT token
  githubTokenValidator(control: AbstractControl): { [key: string]: boolean } | null {
    // Allow alphanumeric characters, underscores (_), hyphens (-), and periods (.)
    const tokenPattern = /^[a-zA-Z0-9-_\.]+$/;
    if (!tokenPattern.test(control.value)) {
      return { 'invalidToken': true };
    }
    return null;
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
