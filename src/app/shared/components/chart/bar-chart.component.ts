import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  template: `<canvas id="barChart" width="400" height="400"></canvas>`,
})
export class BarChartComponent implements OnChanges {
  @Input() chartData!: any;
  @Input() chartLabels!: string[];
  @Input() chartLabel: string = 'Data';

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

    this.chart = new Chart('barChart', {
      type: 'bar' as ChartType,
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            data: this.chartData,
            label: this.chartLabel,
            backgroundColor: 'rgba(0, 123, 255, 0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}
