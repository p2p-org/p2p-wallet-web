import type { FC } from 'react';

import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { FeeInfo, Network } from 'new/scenes/Main/Send';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { numberToString } from 'new/utils/NumberExtensions';
import { capitalizeFirstLetter } from 'new/utils/StringExtensions';

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FirstLineWrapper = styled.div`
  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;

  .isSelected & {
    font-weight: 700;
  }
`;

const SecondLineWrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const FeeLabel = styled.div`
  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
`;

const FeeValue = styled.div`
  margin-left: 4px;

  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 14px;
  line-height: 140%;

  &.green {
    color: ${theme.colors.system.successMain};

    font-weight: 700;
  }
`;

type Props = {
  network: Network;
  payingWallet: Wallet | null;
  feeInfo: FeeInfo | null;
};

export const NetworkView: FC<Props> = observer(({ network, payingWallet, feeInfo }) => {
  return (
    <>
      <TokenAvatar token={payingWallet?.token} size={44} />
      <Content>
        <InfoWrapper>
          <FirstLineWrapper>{capitalizeFirstLetter(network)} network</FirstLineWrapper>
          <SecondLineWrapper>
            <FeeLabel>Transfer fee:</FeeLabel>
            {feeValueEl({ feeInfo, wallet: payingWallet })}
          </SecondLineWrapper>
        </InfoWrapper>
      </Content>
    </>
  );
});

const feeValueEl = ({ feeInfo, wallet }: { feeInfo: FeeInfo | null; wallet: Wallet | null }) => {
  // if empty
  if (
    feeInfo?.feeAmount.transaction.eq(ZERO) &&
    (!feeInfo.feeAmount.others || !feeInfo.feeAmount.others.length)
  ) {
    return <FeeValue className="green">{Defaults.fiat.symbol}0</FeeValue>;
  }

  // total (in SOL)
  const totalFeeInSOL = convertToBalance(feeInfo?.feeAmount.transaction ?? ZERO, 9);

  const fees = `${numberToString(totalFeeInSOL, { maximumFractionDigits: 9 })} ${
    wallet?.token.symbol ?? ''
  }`;

  const otherFees =
    feeInfo?.feeAmount.others?.reduce((acc, otherFee) => {
      acc += `\n${numberToString(otherFee.amount, { maximumFractionDigits: 9 })} ${otherFee.unit}`;
      return acc;
    }, '') ?? null;

  return <FeeValue>{fees + (otherFees ? `\n${otherFees}` : '')}</FeeValue>;
};
