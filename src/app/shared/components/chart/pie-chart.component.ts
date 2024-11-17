import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  template: `<canvas id="pieChart" width="400" height="400"></canvas>`,
})
export class PieChartComponent implements OnChanges {
  @Input() chartData!: any;
  @Input() chartLabels!: string[];

  chart: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData || changes.chartLabels) {
      this.createChart();
    }
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            data: this.chartData,
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
          },
        ],
      },
    });
  }
}