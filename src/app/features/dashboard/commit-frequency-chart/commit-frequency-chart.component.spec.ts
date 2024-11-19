import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommitFrequencyChartComponent } from './commit-frequency-chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { of, throwError } from 'rxjs';

describe('CommitFrequencyChartComponent', () => {
  let component: CommitFrequencyChartComponent;
  let fixture: ComponentFixture<CommitFrequencyChartComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cookieService: jasmine.SpyObj<CookieService>;
  let sharedDataService: SharedDataService;
  let router: Router;
  let httpMock: HttpTestingController;

  const mockUser = { login: 'testUser', name: 'Test User', email: 'test@example.com', avatar_url: 'https://example.com/avatar.png' };
  const mockToken = 'mockGithubToken12345';
  const mockRepos = [{ name: 'repo1' }, { name: 'repo2' }];
  const mockCommitActivity = [
    { week: 1622505600, total: 5 },
    { week: 1623110400, total: 10 }
  ];

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getUserRepos', 'getRepoCommitActivity']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'getUsername', 'fetchUserData']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'delete']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
      ],
      providers: [
        CommitFrequencyChartComponent,
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: Router, useValue: routerSpy },
        SharedDataService,
        provideHttpClient(), 
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommitFrequencyChartComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    sharedDataService = TestBed.inject(SharedDataService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);

    cookieService.get.and.returnValue(mockUser.login);
    dashboardService.getUserRepos.and.returnValue(of(mockRepos));
    dashboardService.getRepoCommitActivity.and.returnValue(of(mockCommitActivity));

    // Mocking the return values for getToken and getUsername
    authService.getToken.and.returnValue('valid-token');
    authService.getUsername.and.returnValue('john_doe');
  });

  afterEach(() => {
    // Ensure no unmatched HTTP requests remain
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data successfully', fakeAsync(() => {
    // Mock the fetchUserData to return an observable with mockUser data
    authService.fetchUserData.and.returnValue(of(mockUser));
  
    // Mock the cookie service to return a valid username
    cookieService.get.and.returnValue(mockUser.login);
  
    // Trigger ngOnInit manually
    component.ngOnInit();
    fixture.detectChanges();
  
    // Simulate async passage of time to allow async tasks to complete
    tick();
    fixture.detectChanges();
  
    // Check that fetchUserData was called
    expect(authService.fetchUserData).toHaveBeenCalled();  // Verify that fetchUserData was called
    expect(component.loading).toBeFalse();  // Ensure loading is set to false after the data load
  }));

  it('should fetch repositories and commit activity on init', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    expect(dashboardService.getUserRepos).toHaveBeenCalledWith(mockUser.login);
    expect(dashboardService.getRepoCommitActivity).toHaveBeenCalledTimes(mockRepos.length);
    expect(component.barChartData.length).toBeGreaterThan(0);
  });

  it('should update bar chart data correctly', () => {
    const monthlyCommits = new Map<string, number>([
      ['Jan 2023', 10],
      ['Feb 2023', 20]
    ]);

    component['updateBarChartData'](monthlyCommits);

    expect(component.barChartData).toEqual([
      { name: 'Jan 2023', value: 10 },
      { name: 'Feb 2023', value: 20 }
    ]);
    expect(component.noDataMessage).toBeNull();
  });
});
