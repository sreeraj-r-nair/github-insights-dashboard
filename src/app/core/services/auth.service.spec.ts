import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = { login: 'testUser', name: 'Test User', email: 'test@example.com' };
  const mockToken = 'mockGithubToken12345';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClientTesting(), // Ensure HttpClientTestingModule is provided
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no unmatched HTTP requests remain
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authenticate', () => {
    it('should authenticate user successfully and store data in localStorage', () => {
      const username = 'testUser';
      const token = 'validToken12345';

      spyOn(service as any, 'setLocalStorage').and.callThrough(); // Mock service's setLocalStorage method

      service.authenticate(username, token).subscribe((result) => {
        expect(result).toBeTrue();
        expect(service.getToken()).toBe(token); // Ensure token is set correctly
        expect(service.isAuthenticated()).toBeTrue(); // Ensure user is authenticated
        expect(service.user()).toEqual(mockUser); // Ensure user data is set
        expect(service.username()).toBe(username); // Ensure username is set
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_token', token); // Ensure token is saved
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_user', mockUser); // Ensure user data is saved
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_username', username); // Ensure username is saved
      });

      // Simulate successful API response
      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser); // Simulate successful response
    });

    it('should handle error when authentication fails', () => {
      const username = 'testUser';
      const token = 'invalidToken12345';

      service.authenticate(username, token).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Invalid token');
          expect(service.isAuthenticated()).toBeFalse(); // Ensure user is not authenticated
          expect(service.user()).toBeNull(); // Ensure user data is not set
          expect(service.username()).toBeNull(); // Ensure username is not set
        }
      });

      // Simulate failed API response
      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear token and user data from signals and localStorage', () => {
      spyOn(service as any, 'removeLocalStorage').and.callThrough(); // Mock service's removeLocalStorage method

      service.logout();

      expect(service.getToken()).toBeNull(); // Ensure token is cleared
      expect(service.isAuthenticated()).toBeFalse(); // Ensure user is logged out
      expect(service.user()).toBeNull(); // Ensure user data is cleared
      expect(service.username()).toBeNull(); // Ensure username is cleared
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_token'); // Ensure token is removed
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_user'); // Ensure user data is removed
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_username'); // Ensure username is removed
    });
  });

  describe('fetchUserData', () => {
    it('should fetch user data and update signals on success', () => {
      spyOn(service as any, 'setLocalStorage').and.callThrough(); // Mock service's setLocalStorage method

      service.fetchUserData();

      // Simulate successful API response
      const req = httpMock.expectOne('https://api.github.com/user');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser); // Simulate successful response

      expect(service.user()).toEqual(mockUser); // Ensure user data is updated
      expect(service.username()).toBe(mockUser.login); // Ensure username is updated
      expect(service['setLocalStorage']).toHaveBeenCalledWith('github_user', mockUser); // Ensure user data is saved
      expect(service['setLocalStorage']).toHaveBeenCalledWith('github_username', mockUser.login); // Ensure username is saved
    });

    it('should handle error when fetching user data fails', () => {
      service.fetchUserData();

      // Simulate failed API response
      const req = httpMock.expectOne('https://api.github.com/user');
      expect(req.request.method).toBe('GET');
      req.flush('Error fetching user data', { status: 500, statusText: 'Internal Server Error' });

      expect(service.user()).toBeNull(); // Ensure user data is not updated
      expect(service.username()).toBeNull(); // Ensure username is not updated
    });
  });

  describe('getUserData', () => {
    it('should fetch specific user data', () => {
      const username = 'testUser';
      spyOn(service as any, 'getAuthHeaders').and.returnValue(new HttpHeaders()); // Mock auth headers

      service.getUserData(username).subscribe((data) => {
        expect(data).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser); // Simulate successful response
    });

    it('should handle error when fetching specific user data fails', () => {
      const username = 'testUser';
      spyOn(service as any, 'getAuthHeaders').and.returnValue(new HttpHeaders()); // Mock auth headers

      service.getUserData(username).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Error fetching user data');
        }
      });

      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush('Error fetching user data', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
