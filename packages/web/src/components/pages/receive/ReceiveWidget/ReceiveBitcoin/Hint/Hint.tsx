import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, theme } from '@p2p-wallet-web/ui';
import { Bitcoin } from '@renproject/chains-bitcoin';
import classNames from 'classnames';

import { HMSCountdown } from 'components/common/HMSCountdown';
import { Loader } from 'components/common/Loader';
import { getRemainingGatewayTime } from 'utils/hooks/renBridge/useLockAndMint';
import { useFetchFees } from 'utils/providers/LockAndMintProvider';

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
  expiryTime: number;
}

export const Hint: FC<Props> = ({ expiryTime }) => {
  const { fees, pending: isFetchingFee } = useFetchFees();

  const timeRemained = getRemainingGatewayTime(expiryTime);

  return (
    <Wrapper>
      <List>
        <Row>
          This address accepts <strong>only Bitcoin</strong>. You may lose assets by sending another
          coin.
        </Row>
        <Row>
          <MinimumTxAmount className={classNames({ inline: isFetchingFee })}>
            Minimum transaction amount of &nbsp;
            {isFetchingFee ? (
              <Loader />
            ) : (
              <>
                <strong>{`${(fees.lock / 10 ** 8) * 2} ${Bitcoin.asset}`}</strong>.
              </>
            )}
          </MinimumTxAmount>
        </Row>
        <Row>
          <HMSCountdown milliseconds={timeRemained} /> is the remaining time to safely send the
          assets.
        </Row>
      </List>
    </Wrapper>
  );
};
