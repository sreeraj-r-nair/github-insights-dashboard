import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitFrequencyChartComponent } from './commit-frequency-chart.component';

describe('CommitFrequencyChartComponent', () => {
  let component: CommitFrequencyChartComponent;
  let fixture: ComponentFixture<CommitFrequencyChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommitFrequencyChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommitFrequencyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
