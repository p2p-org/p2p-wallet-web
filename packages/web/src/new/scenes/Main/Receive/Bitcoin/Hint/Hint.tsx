import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';

const Wrapper = styled.div`
  padding: 16px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.app};
  border-radius: 12px;
  ${borders.primaryRGBA}
`;

const List = styled.ul`
  display: grid;
  grid-gap: 16px;
  margin: 0;
  padding-left: 20px;
`;

const Row = styled.li`
  list-style: disc;
`;

const MinimumTxAmount = styled.div`
  display: flex;

  &.inline {
    display: inline;
  }
`;

interface Props {
  remainingTime: string;
}

export const Hint: FC<Props> = ({ remainingTime }) => {
  return (
    <Wrapper>
      <List>
        <Row>
          This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending another
          coin.
        </Row>
        <Row>
          <MinimumTxAmount>
            Minimum transaction amount of &nbsp;
            <strong>0.000112 BTC</strong>.
          </MinimumTxAmount>
        </Row>
        <Row>
          <strong>{remainingTime}</strong> is the remaining time to safely send the assets.
        </Row>
      </List>
    </Wrapper>
  );
};
