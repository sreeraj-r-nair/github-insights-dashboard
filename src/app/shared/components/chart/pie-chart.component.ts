import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `
    <ngx-charts-advanced-pie-chart
      [view]="[450, 400]"
      [scheme]="colorScheme"
      [results]="chartData"
      [gradient]="gradient">
    </ngx-charts-advanced-pie-chart>
  `,
  imports: [NgxChartsModule]
})
export class PieChartComponent implements OnChanges {
  @Input() chartData: any[] = [];
  @Input() chartLabels: string[] = [];
  @Input() showLabels: boolean = true;
  @Input() isDoughnut: boolean = false;
  @Input() showLegend: boolean = true;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#0f3263', '#ADD8E6', '#1E90FF', '#4682B4', '#5F9EA0', '#87CEEB', '#B0E0E6']
  };
  gradient: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartLabels']) {
      this.updateChartData();
    }
  }

  updateChartData(): void {
    this.chartData = this.chartLabels.map((label, index) => ({
      name: label,
      value: this.chartData[index]
    }));
  }
}
