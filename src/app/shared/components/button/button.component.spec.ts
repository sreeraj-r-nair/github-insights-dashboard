import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonComponent],
    });
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create the button', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct text', () => {
    component.text = 'Click Me';
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('tds-button');
    expect(button.textContent).toContain('Click Me');
  });
});
