import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <ngx-charts-bar-vertical
      [view]="[700, 400]"
      [scheme]="colorScheme"
      [results]="chartData"
      [gradient]="gradient"
      [xAxis]="showXAxis"
      [yAxis]="showYAxis"
      [legend]="false"
      [showXAxisLabel]="showXAxisLabel"
      [showYAxisLabel]="showYAxisLabel"
      [xAxisLabel]="xAxisLabel"
      [yAxisLabel]="yAxisLabel">
    </ngx-charts-bar-vertical>
  `,
  imports: [NgxChartsModule]
})
export class BarChartComponent implements OnChanges {
  @Input() chartData: any[] = [];
  @Input() chartLabels: string[] = [];
  @Input() chartLabel: string = 'Data';

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#0f3263', '#ADD8E6']
  };
  gradient: boolean = false;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Month';
  yAxisLabel: string = 'Commits';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartLabels']) {
      this.updateChartData();
    }
  }
  

  updateChartData(): void {
    if (this.chartLabels.length === this.chartData.length) {
      this.chartData = this.chartData.map((data, index) => ({
        name: this.chartLabels[index],
        value: data.value
      }));
    }
  }  
}
