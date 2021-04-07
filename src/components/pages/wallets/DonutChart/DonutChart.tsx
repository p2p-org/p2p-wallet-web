import React, { FunctionComponent, memo, useMemo, useState } from 'react';
import isEqual from 'react-fast-compare';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { CacheTTL } from 'lib/cachettl';

import { arc } from './utils';

const Wrapper = styled.div``;

const Tooltip = styled.div`
  position: absolute;

  display: none;
  align-items: center;

  height: 40px;
  padding: 8px;

  color: #fff;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

  &.isShow {
    display: flex;
  }
`;

const TokenAvatarStyled = styled(TokenAvatar)`
  margin-right: 8px;
`;

export type DonutChartData = {
  symbol: string;
  amount: number;
  amountUSD: string;
  color?: string;
}[];

const colorsCache = new CacheTTL<string>();

const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const valueToDeg = (value: number, total: number) => {
  return value / (total / 360);
};

type Props = {
  data: DonutChartData;
  size?: number;
  lineWidth?: number;
  offsetDegree?: number;
  borderRadius?: number;
  onSymbolChange: (symbol: string) => void;
};

const DonutChartOrigin: FunctionComponent<Props> = ({
  data,
  size = 110,
  lineWidth = 22,
  offsetDegree = 5,
  borderRadius = 4,
  onSymbolChange,
}) => {
  const [isShow, setIsShow] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedAmountUSD, setSelectedAmountUSD] = useState('0');

  const handleMouseMove = (symbol: string, amountUSD: string) => (
    e: React.MouseEvent<SVGPathElement>,
  ) => {
    if (symbol !== selectedSymbol || !isShow) {
      setIsShow(true);
      setSelectedSymbol(symbol);
      setSelectedAmountUSD(amountUSD);
      onSymbolChange(symbol);
    }

    const tooltip = document.querySelector('#pie-chart-tooltip') as HTMLDivElement;
    if (tooltip) {
      tooltip.style.left = `${e.pageX - 100}px`;
      tooltip.style.top = `${e.pageY - 50}px`;
    }
  };

  const handleMouseOut = () => {
    setIsShow(false);
    onSymbolChange('');
  };

  const segments = useMemo(() => {
    // eslint-disable-next-line unicorn/no-reduce
    const total = data.reduce((p, c) => p + c.amount, 0);

    let startAngle = 0;

    return data.map((slice) => {
      const { symbol, amount, amountUSD, color } = slice;

      let fillColor = colorsCache.get(symbol);
      if (!fillColor) {
        fillColor = color || randomColor();
      }
      colorsCache.set(symbol, fillColor);

      const sectorAngle = valueToDeg(amount, total);
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
        <path
          key={startAngle}
          d={d}
          fill={fillColor}
          onMouseMove={handleMouseMove(symbol, amountUSD)}
          onMouseOut={handleMouseOut}
        />
      );
    });
  }, [data]);

  return (
    <Wrapper>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {segments}
      </svg>
      <Tooltip id="pie-chart-tooltip" className={classNames({ isShow })}>
        <TokenAvatarStyled symbol={selectedSymbol} size={24} /> {selectedAmountUSD}
      </Tooltip>
    </Wrapper>
  );
};

export const DonutChart = memo(DonutChartOrigin, isEqual);
