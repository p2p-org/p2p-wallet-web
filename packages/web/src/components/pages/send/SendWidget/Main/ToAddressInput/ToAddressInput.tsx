import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { useDebounce } from 'react-use';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import type { ResolveUsernameResponse } from 'app/contexts';
import { useNameService, useSendState } from 'app/contexts';
import { AddressText } from 'components/common/AddressText';
import { Loader } from 'components/common/Loader';
import { Icon } from 'components/ui';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

import { IconWrapper, WalletIcon } from './common/styled';
import { ResolvedNameRow } from './ResolvedNameRow';

const WrapperLabel = styled.label`
  display: flex;
  padding: 0 20px 20px;
`;

const SearchIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

const AddressWrapper = styled.div`
  position: relative;

  display: flex;
  flex: 1;
  grid-gap: 16px;
  align-items: center;
  margin-left: 12px;

  min-width: 0;
`;

const ToInputWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
`;

const ToInput = styled.input`
  flex: 1;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  font-family: inherit;
  line-height: 140%;
  letter-spacing: 0.01em;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &.isAddressResolved {
    height: 18px;

    font-size: 16px;
  }

  &.hasError {
    height: 18px;

    font-size: 16px;
  }

  &::placeholder {
    color: ${theme.colors.textIcon.secondary} !important;

    opacity: 1;
  }
`;

const ClearWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: ${theme.colors.bg.primary};
  border: 1px solid #d3d4de;
  border-radius: 8px;
  cursor: pointer;
`;

const ClearIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

const BottomWrapper = styled.div`
  position: relative;

  padding: 20px;

  border-top: 1px solid ${theme.colors.stroke.secondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const RoundStopIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.system.errorMain};
`;

const SearchingWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LoaderWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
`;

const Text = styled.span`
  margin-left: 12px;

  color: ${theme.colors.textIcon.active};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;

  &.isError {
    color: ${theme.colors.system.errorMain};
  }
`;

const ResolvedNamesList = styled.div`
  display: grid;
  grid-gap: 20px;
`;

// TODO: needs to refactor, logic is weird
export const ToAddressInput: FunctionComponent = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trackEventOnce = useTrackEventOnce();

  const { resolveUsername } = useNameService();
  const {
    setResolvedAddress,
    resolvedAddress,
    setToPublicKey,
    toPublicKey,
    blockchain,
    isAddressInvalid,
  } = useSendState();

  const [isFocused, setIsFocused] = useState(false);
  const [isResolvedNamesListOpen, setIsResolvedNamesListOpen] = useState(false);
  const [isResolvingNames, setIsResolvingNames] = useState(false);
  const [resolvedNames, setResolvedNames] = useState<ResolveUsernameResponse[]>([]);

  const [, cancel] = useDebounce(
    () => {
      const resolveName = async () => {
        const prevToPublicKey = toPublicKey;

        setIsResolvingNames(true);
        const resolved = await resolveUsername(toPublicKey);

        // all changes during request. skip
        if (prevToPublicKey !== toPublicKey) {
          return null;
        }

        setIsResolvingNames(false);

        setResolvedNames([]);
        setResolvedAddress(null);

        if (resolved.length === 1) {
          setResolvedAddress(resolved[0]?.owner || null);
        } else if (resolved.length > 1) {
          setResolvedNames(resolved);
        }
      };

      if (blockchain === 'solana' && toPublicKey.length > 0 && toPublicKey.length <= 40) {
        void resolveName();
      } else {
        setResolvedAddress(null);
      }
    },
    300,
    [blockchain, toPublicKey, resolveUsername],
  );
  useEffect(() => () => cancel());

  useEffect(() => {
    if (resolvedNames.length > 1) {
      setIsResolvedNamesListOpen(true);
    } else {
      setIsResolvedNamesListOpen(false);
    }
  }, [resolvedNames.length]);

  useEffect(() => {
    const handleAwayClick = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as HTMLDivElement)) {
        setIsResolvedNamesListOpen(false);
      }
      if (inputRef.current?.contains(e.target as HTMLDivElement) && resolvedNames.length > 1) {
        setIsResolvedNamesListOpen(true);
      }
    };

    window.addEventListener('click', handleAwayClick);
    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, [resolvedNames.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPublicKey = e.target.value.trim();

    if (!nextPublicKey) {
      setResolvedNames([]);
    }

    setToPublicKey(nextPublicKey);
    trackEventOnce('send_address_keydown');
  };

  const handleClear = () => {
    setResolvedNames([]);
    setResolvedAddress(null);
    setToPublicKey('');
  };

  const handleItemClick = useCallback(
    ({ owner, name }: ResolveUsernameResponse) => {
      setIsResolvedNamesListOpen(false);

      setToPublicKey(name);
      setResolvedAddress(owner);
    },
    [setResolvedAddress, setToPublicKey],
  );

  const bottom = useMemo(() => {
    if (isResolvingNames) {
      return (
        <SearchingWrapper>
          <LoaderWrapper>
            <Loader size="32" />
          </LoaderWrapper>
          <Text>Searching...</Text>
        </SearchingWrapper>
      );
    }

    if (!isResolvingNames && !isResolvedNamesListOpen && isAddressInvalid) {
      return (
        <ErrorWrapper>
          <IconWrapper className={classNames({ isError: true })}>
            <RoundStopIcon name="round-stop" />
          </IconWrapper>
          <Text className={classNames({ isError: true })}>There’s no address like this</Text>
        </ErrorWrapper>
      );
    }

    if (isResolvedNamesListOpen) {
      return (
        <ResolvedNamesList ref={listRef}>
          {resolvedNames.map((item: ResolveUsernameResponse) => (
            <ResolvedNameRow key={item.name} item={item} onClick={handleItemClick} />
          ))}
        </ResolvedNamesList>
      );
    }

    return null;
  }, [handleItemClick, isAddressInvalid, isResolvedNamesListOpen, isResolvingNames, resolvedNames]);

  return (
    <>
      <WrapperLabel>
        <IconWrapper className={classNames({ isFocused })}>
          {!isFocused || (!isAddressInvalid && toPublicKey.length > 40) ? (
            <WalletIcon name="wallet" />
          ) : (
            <SearchIcon name="search" />
          )}
        </IconWrapper>
        <AddressWrapper>
          <ToInputWrapper>
            <ToInput
              ref={inputRef}
              placeholder="Username / SOL address"
              value={toPublicKey}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={classNames({
                isAddressResolved: resolvedAddress,
                hasError: isAddressInvalid,
              })}
            />
            {resolvedAddress ? <AddressText address={resolvedAddress} small /> : undefined}
          </ToInputWrapper>
          {toPublicKey ? (
            <ClearWrapper onClick={handleClear}>
              <ClearIcon name="cross" />
            </ClearWrapper>
          ) : undefined}
        </AddressWrapper>
      </WrapperLabel>
      {bottom ? <BottomWrapper>{bottom}</BottomWrapper> : undefined}
    </>
  );
};
