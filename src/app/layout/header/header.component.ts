import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  isMobile: boolean = window.innerWidth <= 768;

  constructor() {
    this.isMobile = window.innerWidth <= 768;
  }
  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/sign-in']).then(() => {
      // Trigger change detection after logout
      this.cdr.detectChanges();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }
}
