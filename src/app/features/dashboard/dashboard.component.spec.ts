import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { GithubUser } from '../../core/services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'username', 'getUserData']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptorsFromDi())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data successfully', () => {
    const mockUser: GithubUser = { login: 'john_doe', name: 'John Doe', email: 'john.doe@example.com' };
    authService.getToken.and.returnValue('valid-token');
    authService.username.and.returnValue('john_doe');
    authService.getUserData.and.returnValue(of(mockUser));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.user()).toEqual(mockUser);
    expect(component.loading()).toBeFalse();
  });

  it('should display error message when user data is not available', () => {
    const errorMessage = 'Failed to load user data';
    authService.getToken.and.returnValue('valid-token');
    authService.username.and.returnValue('john_doe');
    authService.getUserData.and.returnValue(throwError(() => new Error(errorMessage)));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.user()).toBeNull();
    expect(component.loading()).toBeFalse();
  });

  it('should redirect to sign-in if no token is found', () => {
    authService.getToken.and.returnValue(null);
    
    component.ngOnInit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });

  it('should handle null username', () => {
    authService.getToken.and.returnValue('valid-token');
    authService.username.and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.user()).toBeNull();
    expect(component.loading()).toBeFalse();
  });
});
