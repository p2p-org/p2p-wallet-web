import type { FC } from 'react';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  padding: 16px 20px 16px 8px;

  background-color: ${theme.colors.bg.app};
`;

const DescriptionList = styled.ul`
  margin: 0;
  padding-inline-start: 25px;
`;

const DescriptionItem = styled.li`
  font-weight: 400;
  font-size: 12px;
  line-height: 160%;

  ${up.tablet} {
    font-size: 14px;
  }

  & strong {
    font-weight: 500;
  }

  &:not(:last-child) {
    margin-bottom: 25px;
  }
`;

export const DescriptionView: FC = () => {
  return (
    <Wrapper>
      <DescriptionList>
        {[
          'A slippage is a difference between the expected price and the actual price at which a trade is executed',
          'Slippage can occur at any time, but it is most prevalent during periods of <strong>higher volatility</strong>',
          'Transactions that exceed 20% slippage tolerance may be <strong>frontrun</strong>',
          'Slippage tolerance <strong>cannot exceed 50%</strong>',
        ].map((item: string, idx: number) => (
          <DescriptionItem key={idx} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </DescriptionList>
    </Wrapper>
  );
};
