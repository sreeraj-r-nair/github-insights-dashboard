import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FooterComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
