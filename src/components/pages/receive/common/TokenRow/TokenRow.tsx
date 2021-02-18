import React, { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import { Token } from 'api/token/Token';
import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon } from 'components/ui';
import { createAccountForToken } from 'store/slices/wallet/WalletSlice';
import { getExplorerUrl } from 'utils/connection';

const Wrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

const QRIcon = styled(Icon)`
  width: 32px;
  height: 32px;

  color: #a3a5ba;
`;

const QRIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  border-radius: 12px;
`;

const Main = styled.div`
  flex: 1;

  margin: 10px;

  border-radius: 12px;

  &:hover,
  &.isOpen {
    background: ${rgba('#f6f6f8', 0.5)};

    ${QRIcon} {
      color: #5887ff;
    }
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;

  margin: 0 10px;
  padding: 10px 0;

  cursor: pointer;

  &.isOpen {
    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-right: 10px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  padding: 20px 10px 10px;

  border-bottom: 1px dashed ${rgba('#000', 0.05)};
`;

const QRContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QRText = styled.div`
  margin-bottom: 27px;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const QRFooter = styled.div`
  margin-top: 37px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
`;

const QRCreateWrapper = styled(QRWrapper)`
  padding: 20px 10px 37px;
`;

const QRCodeWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const QRCodeBg = styled.div`
  opacity: 0.05;
`;

const AddButton = styled(Button)`
  position: absolute;

  height: 44px;

  font-size: 14px;

  &.isExecuting {
    background: ${rgba('#5887ff', 0.5)};
  }
`;

const Additional = styled.div`
  display: flex;
  align-items: center;

  margin: 15px 10px 0;
  padding: 0 10px 15px;

  border-bottom: 1px dashed ${rgba('#000', 0.05)};
`;

const TokenInfo = styled.div`
  margin-right: 10px;

  cursor: pointer;
`;

const TokenName = styled.div`
  color: #a3a5ba;
  font-weight: 600;
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
  display: flex;

  justify-content: space-between;
  margin: 0 10px;
  padding: 15px 10px;

  font-weight: 600;
  font-size: 14px;

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
  tokenAccount?: TokenAccount;
  isInfluencedFunds?: boolean;
  fee?: number;
  isSelected?: boolean;
  onSelect: (token?: Token, tokenAccount?: TokenAccount) => void;
};

export const TokenRow: FunctionComponent<Props> = ({
  token,
  tokenAccount,
  fee,
  isInfluencedFunds,
  isSelected,
  onSelect,
}) => {
  const dispatch = useDispatch();

  const [isExecuting, setIsExecuting] = useState(false);
  const [isError, setError] = useState(false);
  const [isMintCopied, setIsMintCopied] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [currentTokenAccount, setCurrentTokenAccount] = useState<TokenAccount | undefined>(
    tokenAccount,
  );
  const cluster = useSelector((state) => state.wallet.cluster);

  const handleToggleOpenClick = () => {
    onSelect(isSelected ? undefined : token, isSelected ? undefined : tokenAccount);
  };

  const handleAddClick = async () => {
    try {
      setIsExecuting(true);
      const newTokenAccount = unwrapResult(await dispatch(createAccountForToken({ token })));
      setCurrentTokenAccount(newTokenAccount);
      setIsNew(true);
    } catch (error) {
      setError(true);
      console.log(error);
    } finally {
      setIsExecuting(false);
    }
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrImageSettings: QRCode.ImageSettings = {
    height: 36,
    width: 36,
  };

  if (token.symbol === 'SOL') {
    qrImageSettings.src =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
  } else {
    const iconSrc = tokenConfig[cluster]?.find(
      (tokenItem) => tokenItem.tokenSymbol === token.symbol,
    )?.icon;

    if (iconSrc) {
      qrImageSettings.src = iconSrc;
    }
  }

  return (
    <Wrapper>
      <Main className={classNames({ isOpen: isSelected })}>
        <Content onClick={handleToggleOpenClick} className={classNames({ isOpen: isSelected })}>
          <InfoWrapper>
            <TokenAvatar symbol={token.symbol} size={44} />
            <Info>
              <Top>
                <div>{token.symbol}</div> <div />
              </Top>
              <Bottom>
                <div>{currentTokenAccount?.address.toBase58() || token.name}</div>
                <div />
              </Bottom>
            </Info>
          </InfoWrapper>
          <QRIconWrapper className={classNames({ isOpen: isSelected })}>
            <QRIcon name="qr" />
          </QRIconWrapper>
        </Content>
        {isSelected ? (
          <>
            {currentTokenAccount ? (
              <QRWrapper>
                <QRContent>
                  <QRText>
                    {isNew ? 'Now you can receive tokens on your wallet' : 'Scan or copy QR code'}
                  </QRText>
                  <QRCode
                    value={currentTokenAccount.address.toBase58()}
                    imageSettings={qrImageSettings}
                    size={150}
                  />
                </QRContent>
                {!isNew ? (
                  <QRFooter>
                    All deposits are stored 100% non-custodiallity with keys held on this device
                  </QRFooter>
                ) : undefined}
              </QRWrapper>
            ) : (
              <QRCreateWrapper>
                <QRText>To see wallet address, you should add this token to your token list</QRText>
                <QRCodeWrapper>
                  <QRCodeBg>
                    <QRCode value="address" size={150} />
                  </QRCodeBg>
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
                    {isExecuting ? 'Adding' : 'Add token to your token list'}
                  </AddButton>
                </QRCodeWrapper>
              </QRCreateWrapper>
            )}
            <Additional>
              <TokenInfo onClick={handleCopyClick}>
                <TokenName className={classNames({ isMintCopied })}>
                  {isMintCopied ? 'Mint Address Copied!' : `${token.symbol} Mint Address`}
                </TokenName>
                <TokenAddress>{token.address.toBase58()}</TokenAddress>
              </TokenInfo>
            </Additional>
            <BottomInfo className={classNames({ isError })}>
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
                  {!currentTokenAccount ? (
                    <RightInfo
                      className={classNames({
                        isError: isInfluencedFunds,
                      })}>
                      {`will cost ${fee} SOL`}
                      {isInfluencedFunds ? ' (Influenced funds)' : ''}
                    </RightInfo>
                  ) : undefined}
                </>
              )}
            </BottomInfo>
          </>
        ) : undefined}
      </Main>
    </Wrapper>
  );
};
