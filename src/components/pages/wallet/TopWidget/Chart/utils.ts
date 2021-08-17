import Highcharts from 'highcharts';

export const getConfig = (data: number[][]): Highcharts.Options => ({
  chart: {
    height: 180,
    type: 'area',
    spacing: [5, 0, 0, 0],
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
    tickWidth: 0,
    lineWidth: 0,
    dateTimeLabelFormats: {
      millisecond: '%H:%M:%S.%L',
      second: '%H:%M:%S',
      minute: '%H:%M',
      hour: '%H:%M',
      day: '%e %b',
      week: '%e %b',
      month: "%b '%y",
      year: '%Y',
    },
  },
  plotOptions: {
    series: {
      // pointStart: start,
      // pointInterval: interval,
      animation: false,
    },
    area: {
      fillColor: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
        },
        stops: [
          [0, new Highcharts.Color('#CEDCFF').get('rgb') as string],
          [1, new Highcharts.Color('#E6EDFF').get('rgba') as string],
        ],
      },
      lineWidth: 1,
      color: '#5887FF',
      states: {
        hover: {
          lineWidth: 1,
        },
      },
      marker: {
        radius: 0,
      },
      threshold: null,
      dataGrouping: { enabled: false },
    },
    line: {
      marker: {
        enabled: false,
      },
    },
  },
  tooltip: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 4,
    valueDecimals: 2,
    backgroundColor: '#C4C4C4',
    shadow: false,
    padding: 4,
    style: {
      color: 'white',
    },
    xDateFormat: '%b %d, %Y',
    useHTML: true,
    pointFormatter() {
      // return fiatToString({ value: this.y, decimals, unit: currency });
      return this.y?.toString() || '';
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
