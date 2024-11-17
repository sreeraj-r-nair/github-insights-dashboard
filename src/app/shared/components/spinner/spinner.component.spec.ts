import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpinnerComponent],
    });
    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
  });

  it('should create the spinner', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct size', () => {
    component.size = 'sm';
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('tds-spinner');
    expect(spinner.getAttribute('size')).toBe('sm');
  });

  it('should have correct variant', () => {
    component.variant = 'inverted';
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('tds-spinner');
    expect(spinner.getAttribute('variant')).toBe('inverted');
  });
});
