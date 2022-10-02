import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useEvent } from 'react-use';

import { styled } from '@linaria/react';
import throttle from 'lodash.throttle';

import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { BalanceView } from 'new/scenes/Main/WalletDetail/BalanceView';
import { COLUMN_RIGHT_WIDTH } from 'new/ui/components/common/Layout';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';
import { shortAddress } from 'utils/tokens';

import type { WalletDetailViewModel } from '../WalletDetail.ViewModel';

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const TokenInfo = styled.div`
  max-width: 230px;
  margin-left: 16px;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenSymbol = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
`;

const TokenName = styled.div`
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 16px;
`;

const ButtonStyled = styled(Button)`
  width: 36px;
  padding: 0;

  box-shadow: 0 4px 12px rgba(88, 135, 255, 0.25);
`;

const ActionIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #fff;
`;

const WrapperFixed = styled.div`
  position: fixed;
  top: 64px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: ${COLUMN_RIGHT_WIDTH}px;
  height: 72px;
  padding: 0 20px;

  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const FixedInfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SCROLL_THROTTLE_VALUE = 100;
const WIDGET_BOTTOM_FOR_SHOW_STICKY = 150;

interface Props {
  viewModel: Readonly<WalletDetailViewModel>;
}

export const TopWidget: FC<Props> = ({ viewModel }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isShowFixed, setIsShowFixed] = useState(false);

  const handleScroll = useCallback(
    () =>
      throttle(() => {
        if (!widgetRef.current) {
          return;
        }

        const { bottom } = widgetRef.current.getBoundingClientRect();

        if (bottom <= WIDGET_BOTTOM_FOR_SHOW_STICKY) {
          setIsShowFixed(true);
        } else {
          setIsShowFixed(false);
        }
      }, SCROLL_THROTTLE_VALUE),
    [],
  );

  useEvent('scroll', handleScroll);

  const renderButtons = () => {
    return (
      <Buttons>
        {viewModel.walletActions.map((action) => (
          <ButtonStyled
            key={action.text}
            primary
            small
            title={action.text}
            onClick={() => viewModel.start(action)}
          >
            <ActionIcon name={action.icon} />
          </ButtonStyled>
        ))}
      </Buttons>
    );
  };

  return (
    <>
      <Widget
        ref={widgetRef}
        title={
          viewModel.wallet ? (
            <Header>
              <TokenAvatar token={viewModel.wallet.token} size={44} />
              <TokenInfo>
                <TokenSymbol>{viewModel.wallet.token.symbol}</TokenSymbol>
                <TokenName title={viewModel.wallet.pubkey ?? undefined}>
                  {viewModel.wallet?.token.name ||
                    (viewModel.wallet.pubkey ? shortAddress(viewModel.wallet.pubkey) : null)}
                </TokenName>
              </TokenInfo>
            </Header>
          ) : null
        }
        action={renderButtons()}
      >
        <BalanceView viewModel={viewModel} />
      </Widget>
      {isShowFixed ? (
        <WrapperFixed>
          <FixedInfoWrapper>
            <TokenAvatar token={viewModel.wallet?.token} size={36} />
            <BalanceView viewModel={viewModel} isSticky={true} />
          </FixedInfoWrapper>
          {renderButtons()}
        </WrapperFixed>
      ) : null}
    </>
  );
};
