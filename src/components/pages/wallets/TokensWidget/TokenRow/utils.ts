import { rgba } from 'polished';

export const getConfig = (data: number[][]): Highcharts.Options => ({
  chart: {
    height: 25,
    type: 'line',
    spacing: [0, 0, 0, 0],
  },
  title: {
    text: undefined,
  },
  yAxis: {
    visible: false,
    minPadding: 0,
    maxPadding: 0,
    gridLineColor: 'transparent',
  },
  xAxis: {
    visible: false,
    minPadding: 0,
    maxPadding: 0,
    type: 'datetime',
    gridLineColor: 'transparent',
  },
  plotOptions: {
    series: {
      // pointStart: start,
      // pointInterval: interval,
      animation: false,
    },
    line: {
      enableMouseTracking: false,
      lineWidth: 1,
      color: rgba('#000', 0.5),
    },
  },
  credits: {
    enabled: false,
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      type: 'area',
      name: 'Price',
      data,
    },
  ],
});
