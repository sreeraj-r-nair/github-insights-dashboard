import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { AuthService } from './auth.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('DashboardService', () => {
  let service: DashboardService;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = { login: 'testUser', name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure no unmatched HTTP requests remain
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserData', () => {
    it('should fetch user data successfully', () => {
      spyOn(authService, 'fetchUserData').and.returnValue(of(mockUser));

      service.getUserData('testUser').subscribe((data) => {
        expect(data).toEqual(mockUser);
      });

      // Simulate successful API response
      const req = httpMock.expectOne(`https://api.github.com/users/testUser`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when fetching user data fails', () => {
      spyOn(authService, 'fetchUserData').and.returnValue(throwError(() => new Error('Error fetching user data')));

      service.getUserData('testUser').subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Error fetching user data');
        }
      });

      // Simulate failed API response
      const req = httpMock.expectOne(`https://api.github.com/users/testUser`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Error fetching user data' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
