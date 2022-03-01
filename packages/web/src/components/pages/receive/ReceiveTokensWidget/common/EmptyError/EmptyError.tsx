import type { FC, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui/src/styles';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 12px;
  align-items: center;
  padding: 20px;

  color: ${theme.colors.system.errorMain};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  background: ${theme.colors.system.errorBg};
  border: 1px solid ${theme.colors.system.errorMain};
  border-radius: 12px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.system.errorMain};
  border-radius: 16px;
`;

const RoundStopIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

interface Props extends HTMLAttributes<HTMLDivElement> {
  searchText: string;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const EmptyErrorOriginal: FC<Props> = ({ searchText, forwardedRef, ...props }) => {
  return (
    <Wrapper ref={forwardedRef} {...props}>
      <div>
        <IconWrapper>
          <RoundStopIcon name="round-stop" />
        </IconWrapper>
      </div>
      <div>
        If there is a token named "{searchText}", we don't recommend sending it to your Solana
        address since it will most likely be lost forever.
      </div>
    </Wrapper>
  );
};

export const EmptyError = forwardRef<HTMLInputElement, Props>(
  (props, ref: React.Ref<HTMLInputElement>) => <EmptyErrorOriginal {...props} forwardedRef={ref} />,
);
