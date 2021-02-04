import React, { FunctionComponent, memo } from 'react';
import isEqual from 'react-fast-compare';

import { arc } from './utils';

export type DonutChartData = {
  label: string;
  value: number;
  color?: string;
}[];

const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const valueToDeg = (value: number, total: number) => {
  return value / (total / 360);
};

const renderSegments = (
  size: number,
  data: DonutChartData,
  lineWidth: number,
  offsetDegree: number,
  borderRadius: number,
) => {
  // eslint-disable-next-line unicorn/no-reduce
  const total = data.reduce((p, c) => p + c.value, 0);

  let startAngle = 0;

  return data.map((slice) => {
    const { value, color, label } = slice;
    const fillColor = color || randomColor();

    const sectorAngle = valueToDeg(value, total);
    const d = arc(
      [size / 2, size / 2],
      size / 2,
      startAngle,
      startAngle + sectorAngle - offsetDegree,
      lineWidth,
      borderRadius,
    );

    startAngle += sectorAngle;

    return (
      <path key={startAngle} d={d} fill={fillColor}>
        <title>{label}</title>
      </path>
    );
  });
};

type Props = {
  size?: number;
  data: DonutChartData;
  lineWidth?: number;
  offsetDegree?: number;
  borderRadius?: number;
};

const DonutChartOrigin: FunctionComponent<Props> = ({
  size = 110,
  data,
  lineWidth = 22,
  offsetDegree = 5,
  borderRadius = 4,
}) => {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {renderSegments(size, data, lineWidth, offsetDegree, borderRadius)}
    </svg>
  );
};

export const DonutChart = memo(DonutChartOrigin, isEqual);
