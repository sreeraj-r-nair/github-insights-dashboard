import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, CommonModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

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

  it('should handle click event', () => {
    spyOn(component, 'onClick');
    const button = fixture.nativeElement.querySelector('tds-button');
    button.click();
    expect(component.onClick).toHaveBeenCalled();
  });
});
