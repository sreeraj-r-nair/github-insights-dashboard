import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService, GithubUser } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CommitFrequencyChartComponent } from '../dashboard/commit-frequency-chart/commit-frequency-chart.component';
import { LanguagesUsedChartComponent } from '../dashboard/languages-used-chart/languages-used-chart.component';
import { SummaryTileComponent } from '../dashboard/summary-tile/summary-tile.component';
import { TegelModule } from '@scania/tegel-angular-17';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: GithubUser = { login: 'john_doe', name: 'John Doe', email: 'john.doe@example.com' };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'getUsername', 'getUserData']);
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getUserData', 'getUserSummary', 'getUserRepos', 'getRepoCommitActivity', 'getRepoLanguages']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TegelModule,
        SpinnerComponent,
        CommitFrequencyChartComponent,
        LanguagesUsedChartComponent,
        SummaryTileComponent,
        DashboardComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data successfully', () => {
    authService.getToken.and.returnValue('valid-token');
    authService.getUsername.and.returnValue('john_doe');
    dashboardService.getUserData.and.returnValue(of(mockUser));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.user()).toEqual(mockUser);
    expect(component.loading()).toBeFalse();
  });

  it('should display error message when user data is not available', () => {
    const errorMessage = 'Failed to load user data';
    authService.getToken.and.returnValue('valid-token');
    authService.getUsername.and.returnValue('john_doe');
    dashboardService.getUserData.and.returnValue(throwError(() => new Error(errorMessage)));

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
    authService.getUsername.and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.user()).toBeNull();
    expect(component.loading()).toBeFalse();
  });
});
