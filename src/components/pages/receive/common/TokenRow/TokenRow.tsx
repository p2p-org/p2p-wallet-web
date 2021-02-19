import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import { Token } from 'api/token/Token';
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
  cursor: pointer;
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

  &.isOpen {
    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-right: 10px;

  &.isCopyAvailable {
    cursor: pointer;
  }
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  &.isAddressCopied {
    color: #2db533;
  }
`;

const Bottom = styled.div`
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
  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const QRFooter = styled.div`
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

  margin: 10px 0 20px;
  padding: 17px;

  border-radius: 12px;

  &.isImageCopyAvailable:hover {
    background: #f6f6f8;
    cursor: pointer;
  }
`;

const QRCopiedWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const QRCopied = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 29px;
  padding: 0 11px;

  color: #5887ff;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

// @return Promise<boolean>
async function askClipboardWritePermission() {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { state } = await navigator.permissions.query({ name: 'clipboard-write' });
    return state === 'granted';
  } catch {
    // Browser compatibility / Security error (ONLY HTTPS) ...
    return false;
  }
}

// @params blob - The ClipboardItem takes an object with the MIME type as key, and the actual blob as the value.
// @return Promise<void>
const setToClipboard = async (blob: Blob | null) => {
  if (!blob) {
    ToastManager.error(`Can't copy to clipboard`);
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const data = [new ClipboardItem({ [blob.type]: blob })];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await navigator.clipboard.write(data);
  } catch (error) {
    ToastManager.error((error as Error).toString());
  }
};

const handleCopyClick = (value: string, cb: (state: boolean) => void) => () => {
  try {
    void navigator.clipboard.writeText(value);
    cb(true);
    ToastManager.info(`${value} Address Copied!`);

    // fade copied after some seconds
    setTimeout(() => {
      cb(false);
    }, 2000);
  } catch (error) {
    console.error(error);
  }
};

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
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isMintCopied, setIsMintCopied] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);
  const [currentTokenAccount, setCurrentTokenAccount] = useState<TokenAccount | undefined>(
    tokenAccount,
  );
  const cluster = useSelector((state) => state.wallet.cluster);

  useEffect(() => {
    askClipboardWritePermission()
      .then((state) => setIsImageCopyAvailable(state))
      .catch(() => setIsImageCopyAvailable(false));
  }, []);

  const handleImageCopyClick = () => {
    const qrElement = document.querySelector<HTMLCanvasElement>('#qrcode');
    if (!qrElement) {
      return;
    }

    try {
      qrElement.toBlob((blob: Blob | null) => setToClipboard(blob));
      setIsImageCopied(true);

      // fade copied after some seconds
      setTimeout(() => {
        setIsImageCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrImageSettings: QRCode.ImageSettings = {
    height: 36,
    width: 36,
  };

  // if (token.symbol === 'SOL') {
  //   qrImageSettings.src =
  //     'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
  // } else {
  //   const iconSrc = tokenConfig[cluster]?.find(
  //     (tokenItem) => tokenItem.tokenSymbol === token.symbol,
  //   )?.icon;
  //
  //   if (iconSrc) {
  //     qrImageSettings.src = iconSrc;
  //   }
  // }

  return (
    <Wrapper>
      <Main className={classNames({ isOpen: isSelected })}>
        <Content className={classNames({ isOpen: isSelected })}>
          <InfoWrapper
            className={classNames({ isCopyAvailable: Boolean(currentTokenAccount) })}
            onClick={
              currentTokenAccount
                ? handleCopyClick(currentTokenAccount.address.toBase58(), setIsAddressCopied)
                : undefined
            }>
            <TokenAvatar symbol={token.symbol} size={44} />
            <Info>
              <Top className={classNames({ isAddressCopied })}>
                {isAddressCopied ? 'Mint Address Copied!' : token.symbol}
              </Top>
              <Bottom className={classNames({ isNew })}>
                {currentTokenAccount?.address.toBase58() || token.name}
              </Bottom>
            </Info>
          </InfoWrapper>
          <QRIconWrapper
            className={classNames({ isOpen: isSelected })}
            onClick={handleToggleOpenClick}>
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
                  <QRCodeWrapper
                    className={classNames({ isImageCopyAvailable })}
                    onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
                    {isImageCopied ? (
                      <QRCopiedWrapper>
                        <QRCopied>Copied</QRCopied>
                      </QRCopiedWrapper>
                    ) : undefined}
                    <QRCode
                      id="qrcode"
                      value={currentTokenAccount.address.toBase58()}
                      imageSettings={qrImageSettings}
                      size={150}
                      renderAs="canvas"
                    />
                  </QRCodeWrapper>
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
              <TokenInfo onClick={handleCopyClick(token.address.toBase58(), setIsMintCopied)}>
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
