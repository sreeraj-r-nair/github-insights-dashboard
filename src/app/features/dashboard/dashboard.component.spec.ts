import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardService } from '../../core/services/dashboard.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { SharedDataService } from '../../core/services/shared-data.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SummaryTileComponent } from '../dashboard/summary-tile/summary-tile.component';
import { of, throwError } from 'rxjs';

describe('SummaryTileComponent', () => {
  let component: SummaryTileComponent;
  let fixture: ComponentFixture<SummaryTileComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let cookieService: jasmine.SpyObj<CookieService>;
  let sharedDataService: jasmine.SpyObj<SharedDataService>;

  const mockUsername = 'testUser';
  const mockSummary = { repos: 5, followers: 10, following: 15 };
  const mockTotalCommits = 100;

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getUserSummary']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get']);
    const sharedDataServiceSpy = jasmine.createSpyObj('SharedDataService', [], {
      totalCommits$: of(mockTotalCommits),
    });

    await TestBed.configureTestingModule({
      imports: [CommonModule, SummaryTileComponent], 
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: SharedDataService, useValue: sharedDataServiceSpy },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryTileComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    sharedDataService = TestBed.inject(SharedDataService) as jasmine.SpyObj<SharedDataService>;

    cookieService.get.and.returnValue(mockUsername);
    dashboardService.getUserSummary.and.returnValue(of(mockSummary));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user summary on init', fakeAsync(() => {
    fixture.detectChanges();

    tick();  

    // Trigger change detection again to ensure the view is updated
    fixture.detectChanges();

    // Assertions to check if the values are set properly
    expect(dashboardService.getUserSummary).toHaveBeenCalledWith(mockUsername);
    expect(component.projectCount).toBe(mockSummary.repos);
    expect(component.followers).toBe(mockSummary.followers);
    expect(component.following).toBe(mockSummary.following);
  }));

  it('should subscribe to total commits from shared service', fakeAsync(() => {
    // Trigger change detection (to initialize the subscription)
    fixture.detectChanges();

    tick();  

    // Trigger change detection again after async operations
    fixture.detectChanges();

    // Assertions to check if total commits are set correctly
    expect(component.totalCommits).toBe(mockTotalCommits);
  }));

  it('should display user summary correctly', fakeAsync(() => {
    fixture.detectChanges();

    tick();  

    // Trigger change detection again to ensure the view is updated
    fixture.detectChanges();

    const compiled = fixture.nativeElement;

    // Assertions to ensure the user summary is displayed correctly
    expect(compiled.querySelector('.summary-card:nth-child(1) .count').textContent).toContain(mockSummary.repos);
    expect(compiled.querySelector('.summary-card:nth-child(2) .count').textContent).toContain(mockTotalCommits);
    expect(compiled.querySelector('.summary-card:nth-child(3) .count').textContent).toContain(mockSummary.followers);
    expect(compiled.querySelector('.summary-card:nth-child(4) .count').textContent).toContain(mockSummary.following);
  }));

  it('should handle error when fetching user summary fails', fakeAsync(() => {
    // Simulate an error in fetching user summary data
    dashboardService.getUserSummary.and.returnValue(throwError(() => new Error('Error fetching user summary data')));

    fixture.detectChanges();

    tick();  

    // Trigger change detection again after async operations
    fixture.detectChanges();

    // Assertions to check that the values are set to 0 in case of an error
    expect(component.projectCount).toBe(0);
    expect(component.followers).toBe(0);
    expect(component.following).toBe(0);
  }));
});
