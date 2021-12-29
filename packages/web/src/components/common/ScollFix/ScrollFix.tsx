import type { FunctionComponent } from 'react';
import * as React from 'react';

import { useWidthWithoutScrollbar } from 'utils/hooks/useWidthWithoutScrollbar';

export const ScrollFix: FunctionComponent<React.HTMLAttributes<HTMLDivElement>> = ({
  style,
  ...props
}) => {
  const width = useWidthWithoutScrollbar();

  return <div style={width ? { ...style, width } : style} {...props} />;
};
