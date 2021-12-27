import type { FunctionComponent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';

import { styled } from '@linaria/react';
import type { ResolveUsernameResponse } from '@p2p-wallet-web/core';
import classNames from 'classnames';
import { rgba } from 'polished';

import { useNameService, useSendState } from 'app/contexts';
import { AddressText } from 'components/common/AddressText';
import { Loader } from 'components/common/Loader';
import { Icon } from 'components/ui';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const SearchIcon = styled(Icon)`
  width: 32px;
  height: 32px;

  color: #a3a5ba;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;

  &.isFocused {
    background: #5887ff !important;

    ${WalletIcon}, ${SearchIcon} {
      color: #fff !important;
    }
  }
`;

const WrapperLabel = styled.label`
  display: flex;

  &:hover {
    ${IconWrapper} {
      background: #eff3ff;

      ${WalletIcon}, ${SearchIcon} {
        color: #5887ff;
      }
    }
  }
`;

const ToInput = styled.input`
  flex: 1;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;

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
    color: ${rgba('#A3A5BA', 0.5)};
  }
`;

const AddressWrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 12px;
`;

const Error = styled.div`
  flex-grow: 1;

  font-weight: 600;
  font-size: 14px;

  color: #f43d3d;
`;

const WalletIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const ResolvedNamesList = styled.ul`
  position: absolute;
  margin: 0;
  padding: 8px 10px;
  width: 125%;
  top: 45px;
  right: -20px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgb(0 0 0 / 8%);
  z-index: 10;
`;

const ResolvedNamesItem = styled.li`
  display: flex;
  padding: 16px 10px;

  list-style: none;
  border-radius: 12px;

  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 1px solid #f6f6f8;
  }

  &:hover {
    background: #f6f6f8;
    ${WalletIconWrapper} {
      background: #fff;

      ${WalletIcon} {
        color: #5887ff;
      }
    }
  }
`;

const NameAddress = styled.div`
  display: flex;
  flex-direction: column;

  margin-left: 12px;
`;

const Name = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const LoaderWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 8px;
`;

export const ToAddressInput: FunctionComponent = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
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
        setIsResolvingNames(true);
        const resolved = await resolveUsername(toPublicKey);
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
    100,
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

  const handleItemClick =
    ({ owner, name }: ResolveUsernameResponse) =>
    (e: React.MouseEvent<HTMLLIElement>) => {
      e.preventDefault();

      setIsResolvedNamesListOpen(false);

      setToPublicKey(name);
      setResolvedAddress(owner);
    };

  return (
    <WrapperLabel>
      <IconWrapper className={classNames({ isFocused })}>
        {resolvedAddress || (!isAddressInvalid && toPublicKey.length > 40) ? (
          <WalletIcon name="home" />
        ) : (
          <SearchIcon name="search" />
        )}
      </IconWrapper>
      <AddressWrapper>
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

        {resolvedAddress ? <AddressText address={resolvedAddress} small gray /> : undefined}

        {!isResolvingNames && !isResolvedNamesListOpen && isAddressInvalid ? (
          <Error>There’s no address like this</Error>
        ) : undefined}

        {isResolvingNames ? (
          <LoaderWrapper>
            <Loader />
          </LoaderWrapper>
        ) : undefined}

        {isResolvedNamesListOpen ? (
          <ResolvedNamesList ref={listRef}>
            {resolvedNames.map((item: ResolveUsernameResponse) => (
              <ResolvedNamesItem key={item.name} onClick={handleItemClick(item)}>
                <WalletIconWrapper>
                  <WalletIcon name="home" />
                </WalletIconWrapper>
                <NameAddress>
                  <Name>{item.name}</Name>
                  <AddressText address={item.owner} small gray />
                </NameAddress>
              </ResolvedNamesItem>
            ))}
          </ResolvedNamesList>
        ) : undefined}
      </AddressWrapper>
    </WrapperLabel>
  );
};
