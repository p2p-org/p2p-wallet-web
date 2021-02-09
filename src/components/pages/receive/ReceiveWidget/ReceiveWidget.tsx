import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { SlideContainer } from 'components/common/SlideContainer';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { WidgetPage } from 'components/common/WidgetPage';
import { Icon } from 'components/ui';

const WrapperWidgetPage = styled(WidgetPage)`
  overflow: hidden;
`;

const URLWrapper = styled.div`
  padding: 24px 20px;

  color: #a3a5ba;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
  cursor: pointer;
`;

const URLTitle = styled.div`
  margin-bottom: 12px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CopiedText = styled.div`
  margin-right: 12px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const URLValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px 0 20px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  background: #f6f6f8;
  border-radius: 12px;

  &:hover {
    color: #5887ff;

    ${CopyIcon} {
      color: #5887ff;
    }
  }
`;

const AddressesWrapper = styled.div`
  padding: 18px 20px 24px;
`;

const TokensWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  padding-bottom: 18px;

  & > :not(:last-child) {
    margin-right: 12px;
  }
`;

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  min-width: 98px;
  height: 44px;
  padding: 0 20px 0 6px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  background: #fff;
  border: 1px solid rgba(163, 165, 186, 0.3);
  border-radius: 12px;
  cursor: pointer;

  &.isActive {
    color: #5887ff;

    background: #eff3ff;
    border-color: #eff3ff;
  }

  &:hover {
    color: #5887ff;
  }
`;

const TokenName = styled.div`
  margin-left: 8px;

  white-space: nowrap;
`;

const QRCodeSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 230px;
`;

const QRCopyWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const QRCopy = styled.div`
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

const QRCodeWrapper = styled.div`
  position: relative;

  padding: 17px;

  border-radius: 12px;

  &.isImageCopyAvailable:hover {
    background: #f6f6f8;
    cursor: pointer;
  }
`;

const AddressTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  &.isAddressCopied {
    color: #2db533;
  }
`;

const AddressValue = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AddressWrapper = styled.div`
  padding: 10px 20px;

  background: #f6f6f8;
  border-radius: 12px;

  cursor: pointer;

  &:hover {
    ${AddressValue} {
      color: #5887ff;
    }
  }
`;

const HintWrapper = styled.div`
  padding: 16px 20px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const handleCopyClick = (value: string, cb: (state: boolean) => void) => () => {
  try {
    void navigator.clipboard.writeText(value);
    cb(true);
    ToastManager.info('Copied!');

    // fade copied after some seconds
    setTimeout(() => {
      cb(false);
    }, 2000);
  } catch (error) {
    console.error(error);
  }
};

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

export const ReceiveWidget: FunctionComponent = () => {
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);

  const tokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((token) => TokenAccount.from(token)),
  );
  const availableTokens = useSelector((state) =>
    state.global.availableTokens.map((token) => Token.from(token)),
  );
  const initialTokenAccount = tokenAccounts.find(
    (tokenAccount) => tokenAccount.mint.symbol === 'SOL',
  );
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(initialTokenAccount?.mint);
  const [selectedTokenAccount, setSelectedTokenAccount] = useState<TokenAccount | undefined>(
    initialTokenAccount,
  );

  const urlAddress = 'konstantink.p2pwallet.org';

  useEffect(() => {
    askClipboardWritePermission()
      .then((state) => setIsImageCopyAvailable(state))
      .catch(() => setIsImageCopyAvailable(false));
  }, []);

  const handleTokenSelectClick = (token: Token, tokenAccount?: TokenAccount) => () => {
    setSelectedToken(token);
    setSelectedTokenAccount(tokenAccount);
  };

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

  const renderToken = useCallback(
    (token: Token, tokenAccount?: TokenAccount) => {
      return (
        <TokenWrapper
          key={token.symbol}
          className={classNames({ isActive: selectedToken ? token.equals(selectedToken) : false })}
          onClick={handleTokenSelectClick(token, tokenAccount)}>
          <TokenAvatar symbol={token.symbol} size={32} />
          <TokenName>{token.symbol}</TokenName>
        </TokenWrapper>
      );
    },
    [selectedToken],
  );

  const renderTokens = useCallback(() => {
    // sort, uniq, and with symbol
    const sortedUniqTokenAccounts = tokenAccounts
      .sort((a, b) => b.balance.cmp(a.balance))
      .filter(
        (value, index, self) =>
          value.mint.symbol && index === self.findIndex((t) => t.equals(value)),
      );
    const renderSortedUniqTokenAccounts = sortedUniqTokenAccounts.map((tokenAccount) =>
      renderToken(tokenAccount.mint, tokenAccount),
    );

    // get tokens not included in sortedUniqTokenAccounts
    const otherAvailableTokens = availableTokens.filter(
      (token) => !sortedUniqTokenAccounts.find((tokenAccount) => token.equals(tokenAccount.mint)),
    );
    const renderOtherTokens = otherAvailableTokens.map((token) => renderToken(token));

    return renderSortedUniqTokenAccounts.concat(renderOtherTokens);
  }, [selectedToken, availableTokens, tokenAccounts]);

  return (
    <WrapperWidgetPage title="Receive" icon="bottom">
      <URLWrapper>
        <URLTitle>Send tokens directly to you wallet via URL</URLTitle>
        <URLValue onClick={handleCopyClick(urlAddress, setIsUrlCopied)}>
          konstantink.p2pwallet.org
          <RightWrapper>
            {isUrlCopied ? <CopiedText>Copied!</CopiedText> : undefined}
            <CopyWrapper>
              <CopyIcon name="copy" />
            </CopyWrapper>
          </RightWrapper>
        </URLValue>
      </URLWrapper>

      <AddressesWrapper>
        <SlideContainer>
          <TokensWrapper>{renderTokens()}</TokensWrapper>
        </SlideContainer>
        {selectedTokenAccount ? (
          <>
            <QRCodeSection>
              <QRCodeWrapper
                className={classNames({ isImageCopyAvailable })}
                onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
                {isImageCopied ? (
                  <QRCopyWrapper>
                    <QRCopy>Copied</QRCopy>
                  </QRCopyWrapper>
                ) : undefined}
                <QRCode
                  id="qrcode"
                  value={selectedTokenAccount.address.toBase58()}
                  size={150}
                  renderAs="canvas"
                />
              </QRCodeWrapper>
            </QRCodeSection>
            <AddressWrapper
              onClick={handleCopyClick(
                selectedTokenAccount.address.toBase58(),
                setIsAddressCopied,
              )}>
              <AddressTitle className={classNames({ isAddressCopied })}>
                {isAddressCopied ? 'Copied!' : 'Wallet address'}
              </AddressTitle>
              <AddressValue>{selectedTokenAccount.address.toBase58()}</AddressValue>
            </AddressWrapper>
          </>
        ) : undefined}
      </AddressesWrapper>
      <HintWrapper>
        All deposits are stored 100% non-custodiallity with keys held on this device
      </HintWrapper>
    </WrapperWidgetPage>
  );
};
