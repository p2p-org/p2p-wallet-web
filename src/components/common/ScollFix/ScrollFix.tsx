import React, { FunctionComponent } from 'react';

import { useWidthWithoutScrollbar } from 'utils/hooks/useWitdthWithoutScrollbar';

export const ScrollFix: FunctionComponent = (props) => {
  const width = useWidthWithoutScrollbar();

  return <div style={width ? { width } : undefined} {...props} />;
};
