import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <tds-spinner
      [size]="size"
      [variant]="variant"
    ></tds-spinner>
  `,
  styleUrls: ['./spinner.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SpinnerComponent {
  @Input() size: 'lg' | 'md' | 'sm' | 'xs' = 'lg';  // Default to large size
  @Input() variant: 'standard' | 'inverted' = 'standard';  // Default to standard variant
}
