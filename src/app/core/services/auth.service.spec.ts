import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let cookieService: CookieService;
  let router: Router;

  const mockUser = { login: 'testUser', name: 'Test User', email: 'test@example.com' };
  const mockToken = 'mockGithubToken12345';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        CookieService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieService = TestBed.inject(CookieService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    // Ensure no unmatched HTTP requests remain
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authenticate', () => {
    it('should authenticate user successfully and store data in cookies', () => {
      const username = 'testUser';
      const token = 'validToken12345';

      service.authenticate(username, token).subscribe((result) => {
        expect(result).toBeTrue();
        expect(service.getToken()).toBe(token); 
        expect(service.isAuthenticated()).toBeTrue(); 
        expect(service.getUser()).toEqual(mockUser); 
        expect(service.getUsername()).toBe(username); 
        expect(cookieService.get('github_token')).toBe(token); 
        expect(cookieService.get('github_user')).toBe(JSON.stringify(mockUser)); 
        expect(cookieService.get('github_username')).toBe(username); 
      });

      // Simulate successful API response
      const req = httpMock.expectOne((request) => request.url === `https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when authentication fails', () => {
      const username = 'testUser';
      const token = 'invalidToken12345';

      service.authenticate(username, token).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Invalid token format');
          expect(service.isAuthenticated()).toBeFalse();
          expect(service.getUser()).toBeNull(); // Ensure user data is not set
          expect(service.getUsername()).toBeNull(); // Ensure username is not set
        }
      });

      // Simulate failed API response
      const req = httpMock.expectOne((request) => request.url === `https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear all states and navigate to sign-in page', () => {
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.getUser()).toBeNull();
      expect(service.getUsername()).toBeNull();
      expect(cookieService.get('github_token')).toBe('');
      expect(cookieService.get('github_user')).toBe('');
      expect(cookieService.get('github_username')).toBe('');
      expect(router.navigate).toHaveBeenCalledWith(['/signin']);
    });
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully', () => {
      service['token'].set(mockToken);
      service.fetchUserData().subscribe((data) => {
        expect(data).toEqual(mockUser);
        expect(service.getUser()).toEqual(mockUser);
        expect(cookieService.get('github_user')).toBe(JSON.stringify(mockUser));
      });

      // Simulate successful API response
      const req = httpMock.expectOne(`https://api.github.com/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when fetching user data fails', () => {
      service['token'].set(mockToken);
      service.fetchUserData().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Token expired, please log in again');
          expect(service.isAuthenticated()).toBeFalse();
          expect(service.getUser()).toBeNull();
          expect(service.getUsername()).toBeNull();
        }
      });

      // Simulate failed API response
      const req = httpMock.expectOne(`https://api.github.com/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
