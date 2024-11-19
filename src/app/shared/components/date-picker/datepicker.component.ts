import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  template: `
    <mat-form-field>
      <mat-label>{{ label }}</mat-label>
      <input matInput [matDatepicker]="picker" [(ngModel)]="date" (ngModelChange)="onDateChange($event)">
      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DatepickerComponent {
  @Input() label: string = '';
  @Input() date: Date | null = null;
  @Output() dateChange = new EventEmitter<Date | null>();

  onDateChange(date: Date | null): void {
    this.dateChange.emit(date);
  }
}
