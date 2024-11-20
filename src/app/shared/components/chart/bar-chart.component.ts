import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <ngx-charts-bar-vertical
      [view]="view"
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
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Month';
  yAxisLabel: string = 'Commits';

  view: [number, number] = [700, 400];  // Default view size

  constructor() {
    // Automatically update chart size when screen size changes
    this.updateChartSize();
  }

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

  // Dynamically update the chart size based on the window width
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateChartSize();
  }

  private updateChartSize(): void {
    const width = window.innerWidth;
    if (width < 600) {
      this.view = [width - 40, 300];  // For mobile devices, reduce chart width
    } else if (width < 900) {
      this.view = [width - 100, 400];  // For tablet devices
    } else {
      this.view = [600, 400];  // For larger screens, use the default size
    }
  }
}
