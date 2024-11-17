import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <tds-button
      [type]="type"
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [fullbleed]="fullbleed"
      [text]="text"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </tds-button>
  `,
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() type: 'button' | 'reset' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'lg' | 'md' | 'sm' | 'xs' = 'lg';
  @Input() disabled: boolean = false;
  @Input() fullbleed: boolean = false;
  @Input() text: string | undefined;
  
  // Handle click event if necessary
  onClick(event: Event): void {
    console.log('Button clicked:', event);
  }
}
