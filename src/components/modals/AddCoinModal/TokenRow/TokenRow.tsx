import React, { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon } from 'components/ui';
import { createAccountForToken } from 'store/slices/wallet/WalletSlice';
import { getExplorerUrl } from 'utils/connection';

const Wrapper = styled.div`
  display: flex;

  padding-top: 10px;
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  background: #f6f6f8;
  border-radius: 8px;
  transform: rotate(270deg);
  cursor: pointer;

  &.isOpen {
    background: #a3a5ba;
    transform: rotate(0deg);

    ${ChevronIcon} {
      color: #fff;
    }
  }
`;

const Main = styled.div`
  flex: 1;

  padding: 0 20px;

  &.isOpen {
    background: ${rgba('#f6f6f8', 0.5)};
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;

  padding: 10px 0;

  &.isOpen {
    padding-bottom: 20px;

    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-right: 48px;

  cursor: pointer;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;

  font-size: 14px;
  line-height: 17px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #202020;
  font-weight: 600;
  font-size: 18px;
  line-height: 27px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 16px;
`;

const Additional = styled.div`
  display: none;

  margin-top: 15px;

  &.isOpen {
    display: flex;
    align-items: center;

    padding-bottom: 15px;

    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }
`;

const TokenInfo = styled.div`
  flex: 1;

  margin-right: 10px;

  cursor: pointer;
`;

const AddButton = styled(Button)`
  height: 44px;

  &.isExecuting {
    background: ${rgba('#5887ff', 0.5)};
  }
`;

const TokenName = styled.div`
  color: #a3a5ba;
  font-size: 14px;
  line-height: 16px;

  &.isMintCopied {
    color: #2db533;
  }
`;

const TokenAddress = styled.div`
  margin-top: 4px;

  color: #000;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
`;

const PlusIconWrapper = styled.div`
  padding-right: 5px;
`;

const PlusIcon = styled(Icon)`
  width: 24px;
`;

const BottomInfo = styled.div`
  display: none;

  justify-content: space-between;

  font-weight: 600;
  font-size: 14px;

  &.isOpen {
    display: flex;

    padding: 15px 0;
  }

  &.isError {
    justify-content: center;
  }
`;

const ExplorerA = styled.a`
  color: #a3a5ba;
`;

const RightInfo = styled.div`
  color: #5887ff;

  &.isError {
    color: #f43f3d;
  }
`;

const Error = styled.div`
  color: #f43f3d;
`;

const LoaderBlockStyled = styled(LoaderBlock)`
  margin-right: 8px;
`;

type Props = {
  token: Token;
  isInfluencedFunds: boolean;
  fee: number;
  closeModal: () => void;
};

export const TokenRow: FunctionComponent<Props> = ({
  token,
  fee,
  isInfluencedFunds,
  closeModal,
}) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isError, setError] = useState(false);
  const [isMintCopied, setIsMintCopied] = useState(false);
  const cluster = useSelector((state) => state.wallet.network.cluster);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAddClick = async () => {
    try {
      setIsExecuting(true);
      await dispatch(createAccountForToken({ token }));
    } catch (error) {
      setError(true);
      console.log(error);
    } finally {
      setIsExecuting(false);
    }
    // dispatch(getTokenAccountsForWallet());
    closeModal();
  };

  const handleCopyClick = () => {
    try {
      void navigator.clipboard.writeText(token.address.toBase58());
      setIsMintCopied(true);
      ToastManager.info(`${token.address.toBase58()} Address Copied!`);

      // fade copied after some seconds
      setTimeout(() => {
        setIsMintCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <Main className={classNames({ isOpen })}>
        <Content className={classNames({ isOpen })}>
          <InfoWrapper onClick={handleChevronClick}>
            <TokenAvatar symbol={token.symbol} size={45} />
            <Info>
              <Top>
                <div>{token.symbol}</div> <div />
              </Top>
              <Bottom>
                <div>{token.name}</div> <div />
              </Bottom>
            </Info>
          </InfoWrapper>
          <ChevronWrapper onClick={handleChevronClick} className={classNames({ isOpen })}>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        </Content>
        <Additional className={classNames({ isOpen })}>
          <TokenInfo onClick={handleCopyClick}>
            <TokenName className={classNames({ isMintCopied })}>
              {isMintCopied ? 'Mint Address Copied!' : `${token.symbol} Mint Address`}
            </TokenName>
            <TokenAddress>{token.address.toBase58()}</TokenAddress>
          </TokenInfo>
          <AddButton
            primary
            disabled={isExecuting}
            onClick={handleAddClick}
            className={classNames({ isExecuting })}>
            {isExecuting ? (
              <LoaderBlockStyled />
            ) : (
              <PlusIconWrapper>
                <PlusIcon name="plus" />
              </PlusIconWrapper>
            )}
            {isExecuting ? 'Adding' : 'Add token'}
          </AddButton>
        </Additional>
        <BottomInfo className={classNames({ isOpen, isError })}>
          {isError ? (
            <Error>Something went wrong. We couldn’t add a token to your list.</Error>
          ) : (
            <>
              <ExplorerA
                href={getExplorerUrl('address', token.address.toBase58(), cluster)}
                target="_blank"
                rel="noopener noreferrer noindex"
                className="button">
                View in Solana explorer
              </ExplorerA>
              <RightInfo
                className={classNames({
                  isError: isInfluencedFunds,
                })}>
                {`will cost ${fee} SOL`}
                {isInfluencedFunds ? ' (Influenced funds)' : ''}
              </RightInfo>
            </>
          )}
        </BottomInfo>
      </Main>
    </Wrapper>
  );
};
