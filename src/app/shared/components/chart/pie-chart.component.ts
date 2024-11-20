import { Component, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts'; 

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `
    <ngx-charts-pie-chart
      [view]="view"
      [scheme]="colorScheme"
      [results]="chartData"
      [gradient]="gradient"
      [doughnut]="isDoughnut"
      [legend]="showLegend"
      [legendPosition]="legendPosition"
      [labels]="showLabels">
    </ngx-charts-pie-chart>
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
  
  view: [number, number] = [450, 400];
  legendPosition: LegendPosition = LegendPosition.Right; 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] || changes['chartLabels']) {
      this.updateChartData();
    }
  }

  updateChartData(): void {
    if (!this.chartData || !this.chartLabels) {
      console.warn('chartData or chartLabels are not defined');
      return;
    }

    if (this.chartData.length !== this.chartLabels.length) {
      console.error('chartData and chartLabels must have the same length');
      return;
    }

    this.chartData = this.chartLabels.map((label, index) => ({
      name: label,
      value: this.chartData[index]
    }));
  }

  // Dynamically update the chart size and legend position based on window size
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateChartSize();
  }

  private updateChartSize(): void {
    const width = window.innerWidth;
  
    // Adjust the pie chart size based on the screen width
    if (width < 600) {
      this.view = [width - 40, 300];  
      this.legendPosition = LegendPosition.Below;  
    } else if (width < 900) {
      this.view = [width - 100, 400];  
      this.legendPosition = LegendPosition.Right;  
    } else {
      this.view = [450, 400];  
      this.legendPosition = LegendPosition.Right; 
    }
  }
}
