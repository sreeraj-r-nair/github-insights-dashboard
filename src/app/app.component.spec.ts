import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TegelModule } from '@scania/tegel-angular-17';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUser']);

    TestBed.configureTestingModule({
      imports: [CommonModule, RouterOutlet, TegelModule, HeaderComponent, FooterComponent, AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return true when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
  });

  it('should return false when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    expect(component.isAuthenticated()).toBeFalse();
  });

  it('should handle error thrown by isAuthenticated method', () => {
    authService.isAuthenticated.and.throwError('Unexpected error');
    expect(() => component.isAuthenticated()).toThrowError('Unexpected error');
  });

  it('should call isAuthenticated method from AuthService on component initialization', () => {
    fixture.detectChanges();
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

});
