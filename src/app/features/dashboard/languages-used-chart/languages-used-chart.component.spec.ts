import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagesUsedChartComponent } from './languages-used-chart.component';

describe('LanguagesUsedChartComponent', () => {
  let component: LanguagesUsedChartComponent;
  let fixture: ComponentFixture<LanguagesUsedChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguagesUsedChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguagesUsedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
