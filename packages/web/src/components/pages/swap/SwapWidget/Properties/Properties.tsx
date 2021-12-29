import type { FC } from 'react';

import { styled } from '@linaria/react';
import { isNil } from 'ramda';

import { useSwap } from 'app/contexts/swapSerum';

// import { TooltipRow, TxName, TxValue } from 'components/core/SendSwapWidget/core/styled';
// import { Tooltip } from 'components/ui';

const Wrapper = styled.div`
  &:not(:empty) {
    padding-bottom: 20px;
  }

  > :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const PropertyLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const PropertyValue = styled.div`
  color: #000;
`;

// const TooltipStyled = styled(Tooltip)`
//   border-bottom: 1px dashed #a3a5ba;
// `;

export const Properties: FC = () => {
  const { slippage } = useSwap();

  return (
    <Wrapper>
      {/* {minimumToAmountWithSlippage ? ( */}
      {/*  <PropertyLine> */}
      {/*    Minimum Received: */}
      {/*    <PropertyValue> */}
      {/*      {minimumToAmountWithSlippage.toNumber().toFixed(secondToken?.decimals)}{' '} */}
      {/*      {secondToken?.symbol} */}
      {/*    </PropertyValue> */}
      {/*  </PropertyLine> */}
      {/* ) : undefined} */}
      {/* {isShowFee ? ( */}
      {/*  <> */}
      {/*    <PropertyLine> */}
      {/*      Liquidity Provider Fee: */}
      {/*      <PropertyValue> */}
      {/*        {liquidityProviderFee} {feeProperties?.token?.symbol} */}
      {/*      </PropertyValue> */}
      {/*    </PropertyLine> */}
      {/*    <PropertyLine> */}
      {/*      Fee: */}
      {/*      <PropertyValue> */}
      {/*        <TooltipStyled title={totalFeeString}> */}
      {/*          <TooltipRow> */}
      {/*            <TxName>Transaction:</TxName> */}
      {/*            <TxValue>{transactionFee}</TxValue> */}
      {/*          </TooltipRow> */}
      {/*          {accountRent ? ( */}
      {/*            <TooltipRow> */}
      {/*              <TxName>Wallet creation:</TxName> */}
      {/*              <TxValue>{accountRent}</TxValue> */}
      {/*            </TooltipRow> */}
      {/*          ) : undefined} */}
      {/*        </TooltipStyled> */}
      {/*      </PropertyValue> */}
      {/*    </PropertyLine> */}
      {/*  </> */}
      {/* ) : undefined} */}
      {!isNil(slippage) ? (
        <PropertyLine>
          Slippage:
          <PropertyValue>{slippage} %</PropertyValue>
        </PropertyLine>
      ) : undefined}
    </Wrapper>
  );
};
