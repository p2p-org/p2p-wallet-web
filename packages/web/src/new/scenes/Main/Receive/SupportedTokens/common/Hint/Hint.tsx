import type { FC } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { borders, theme, up } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  margin-bottom: 8px;
  padding: 16px 20px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.app};
  border-radius: 12px;
  ${borders.primary}

  ${up.tablet} {
    margin-bottom: 0;
  }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  key?: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const HintOrigin: FC<Props> = ({ key, forwardedRef, style }) => {
  return (
    <Wrapper key={key} ref={forwardedRef} style={style}>
      Each token in this list is available for receiving with this address; you can search for a
      token by typing its name or ticker.
      <br />
      <br />
      If a token is not on this list,{' '}
      <strong>we do not recommend sending it to this address</strong>.
    </Wrapper>
  );
};

export const Hint = forwardRef<HTMLDivElement, Props>((props, ref: React.Ref<HTMLDivElement>) => (
  <HintOrigin {...props} forwardedRef={ref} />
));
