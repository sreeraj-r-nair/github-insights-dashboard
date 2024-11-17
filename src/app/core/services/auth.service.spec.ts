import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpHeaders, provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = { login: 'testUser', name: 'Test User', email: 'test@example.com' };
  const mockToken = 'mockGithubToken12345';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(), 
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authenticate', () => {
    it('should authenticate user successfully and store data in localStorage', () => {
      const username = 'testUser';
      const token = 'validToken12345';
  
      spyOn(service as any, 'setLocalStorage').and.callThrough(); // Mock setLocalStorage method
  
      service.authenticate(username, token).subscribe((result) => {
        expect(result).toBeTrue();
        expect(service.getToken()).toBe(token); 
        expect(service.isAuthenticated()).toBeTrue(); 
        expect(service.user()).toEqual(mockUser); 
        expect(service.username()).toBe(username); 
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_token', token); 
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_user', mockUser); 
        expect(service['setLocalStorage']).toHaveBeenCalledWith('github_username', username); 
      });
  
      // Simulate successful API response
      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  
    it('should handle error when authentication fails', () => {
      const username = 'testUser';
      const token = 'invalidToken12345'; 
  
      service.authenticate(username, token).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.message).toBe('Invalid token'); 
          expect(service.isAuthenticated()).toBeFalse(); 
          expect(service.user()).toBeNull(); 
          expect(service.username()).toBeNull();
        },
      });
  
      // Simulate failed API response
      const req = httpMock.expectOne(`https://api.github.com/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Invalid token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
  

  describe('logout', () => {
    it('should clear token and user data from signals and localStorage', () => {
      spyOn(service as any, 'removeLocalStorage').and.callThrough();

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.user()).toBeNull();
      expect(service.username()).toBeNull();
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_token');
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_user');
      expect(service['removeLocalStorage']).toHaveBeenCalledWith('github_username');
    });
  });

  describe('fetchUserData', () => {
    it('should fetch user data and update signals on success', () => {
      spyOn(service as any, 'setLocalStorage').and.callThrough();

      service.fetchUserData();

      // Simulate successful API response
      const req = httpMock.expectOne('https://api.github.com/user');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser); 

      expect(service.user()).toEqual(mockUser); 
      expect(service.username()).toBe(mockUser.login);
      expect(service['setLocalStorage']).toHaveBeenCalledWith('github_user', mockUser); 
      expect(service['setLocalStorage']).toHaveBeenCalledWith('github_username', mockUser.login);
    });

    it('should handle error when fetching user data fails', () => {
      service.fetchUserData();

      // Simulate failed API response
      const req = httpMock.expectOne('https://api.github.com/user');
      expect(req.request.method).toBe('GET');
      req.flush('Error fetching user data', { status: 500, statusText: 'Internal Server Error' });

      expect(service.user()).toBeNull();
      expect(service.username()).toBeNull();
    });
  });

  describe('getUserData', () => {
    it('should fetch specific user data', () => {
      const username = 'testUser';
      spyOn(service as any, 'getAuthHeaders').and.returnValue(new HttpHeaders());

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
