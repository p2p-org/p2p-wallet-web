/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment,global-require
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
