import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguagesUsedChartComponent } from './languages-used-chart.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PieChartComponent } from '../../../shared/components/chart/pie-chart.component';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('LanguagesUsedChartComponent', () => {
  let component: LanguagesUsedChartComponent;
  let fixture: ComponentFixture<LanguagesUsedChartComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let authService: AuthService;
  let cookieService: jasmine.SpyObj<CookieService>;
  let httpMock: HttpTestingController;

  const mockUsername = 'testUser';
  const mockRepos = [{ name: 'repo1' }, { name: 'repo2' }];
  const mockLanguages = { JavaScript: 1000, TypeScript: 500 };

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getUserRepos', 'getRepoLanguages']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'delete']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, LanguagesUsedChartComponent, PieChartComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguagesUsedChartComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    authService = TestBed.inject(AuthService);
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    httpMock = TestBed.inject(HttpTestingController);

    cookieService.get.and.returnValue(mockUsername);
    cookieService.delete.and.stub(); // Mock the delete method to do nothing

    dashboardService.getUserRepos.and.returnValue(of(mockRepos));
    dashboardService.getRepoLanguages.and.returnValue(of(mockLanguages));
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no unmatched HTTP requests remain
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update languages data correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(dashboardService.getUserRepos).toHaveBeenCalledWith(mockUsername);
    expect(dashboardService.getRepoLanguages).toHaveBeenCalledTimes(mockRepos.length);
    expect(component.chartData.length).toBeGreaterThan(0);
  });

  it('should fetch repositories and languages on init', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(dashboardService.getUserRepos).toHaveBeenCalledWith(mockUsername);
    expect(dashboardService.getRepoLanguages).toHaveBeenCalledTimes(mockRepos.length);
    expect(component.chartData.length).toBeGreaterThan(0);
  });

  it('should handle error correctly', () => {
    const errorMessage = 'Failed to load data';
    dashboardService.getUserRepos.and.returnValue(throwError(() => new Error(errorMessage)));

    component.ngOnInit();
    fixture.detectChanges();

    expect(dashboardService.getUserRepos).toHaveBeenCalledWith(mockUsername);
    expect(component.noDataMessage).toBe('Error fetching repositories data.'); // Match the actual error message
  });
});
