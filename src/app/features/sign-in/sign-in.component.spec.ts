import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['authenticate']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, SignInComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup spy for authenticate method
    authService.authenticate.and.returnValue(of(true));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.signInForm).toBeDefined();
    expect(component.signInForm.controls['username']).toBeDefined();
    expect(component.signInForm.controls['token']).toBeDefined();
  });

  it('should mark the form as touched and not submit if invalid', () => {
    component.signInForm.controls['username'].setValue('');
    component.signInForm.controls['token'].setValue('');
    
    const spy = spyOn(component.signInForm, 'markAllAsTouched');
    
    component.signInWithPAT();
    
    expect(spy).toHaveBeenCalled();
    expect(authService.authenticate).not.toHaveBeenCalled(); // Ensure no authentication attempt
  });

  it('should authenticate and redirect to dashboard on successful sign-in with PAT', async () => {
    const mockResponse = of(true); // Simulate a successful response
    authService.authenticate.and.returnValue(mockResponse);

    component.signInForm.controls['username'].setValue('testUser');
    component.signInForm.controls['token'].setValue('validToken');

    component.signInWithPAT();

    // Use fixture.whenStable() to ensure the async operation is complete
    await fixture.whenStable();

    expect(authService.authenticate).toHaveBeenCalledWith('testUser', 'validToken');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle authentication error with PAT', async () => {
    const mockError = throwError(() => new Error('Invalid PAT or Authentication Failed'));
    authService.authenticate.and.returnValue(mockError);

    component.signInForm.controls['username'].setValue('testUser');
    component.signInForm.controls['token'].setValue('invalidToken');

    spyOn(window, 'alert');
    component.signInWithPAT();

    // Use fixture.whenStable() to ensure the async operation is complete
    await fixture.whenStable();

    expect(authService.authenticate).toHaveBeenCalledWith('testUser', 'invalidToken');
    expect(window.alert).toHaveBeenCalledWith('Invalid PAT or Authentication Failed');
  });

  it('should not authenticate if username or token contains special characters', () => {
    component.signInForm.controls['username'].setValue('!@#');
    component.signInForm.controls['token'].setValue('!@#');

    component.signInWithPAT();
    
    expect(authService.authenticate).not.toHaveBeenCalled();
  });

  it('should handle edge cases for form validation', () => {
    // Return a boolean observable as expected
    spyOn(authService, 'authenticate').and.returnValue(of(false));

    // Test case: empty form
    component.signInForm.controls['username'].setValue('');
    component.signInForm.controls['token'].setValue('');
    component.signInWithPAT();
    expect(authService.authenticate).not.toHaveBeenCalled();

    // Test case: very long input
    component.signInForm.controls['username'].setValue('a'.repeat(256));
    component.signInForm.controls['token'].setValue('a'.repeat(256));
    component.signInWithPAT();
    expect(authService.authenticate).not.toHaveBeenCalled();

    // Test case: valid username and token
    component.signInForm.controls['username'].setValue('testUser');
    component.signInForm.controls['token'].setValue('validToken');
    component.signInWithPAT();
    expect(authService.authenticate).toHaveBeenCalledWith('testUser', 'validToken');
  });

  it('should construct the OAuth URL correctly', () => {
    // Mock window.location object, using a location set method
    const locationSpy = spyOn(window.location, 'assign').and.callFake((url: string) => {
      expect(url).toBe('https://github.com/login/oauth/authorize?client_id=MY_CLIENT_ID&scope=repo,user');
    });

    // Call the method that triggers the OAuth redirect
    component.signInWithOAuth();

    // Check that the URL was correctly set
    expect(locationSpy).toHaveBeenCalled();
  });

});
