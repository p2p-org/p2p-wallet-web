import React, { FunctionComponent, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { ResolveUsernameResponce } from 'api/nameService';
import { AddressText } from 'components/common/AddressText';
import { Icon } from 'components/ui';

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
  box-shadow: 0px 0px 12px rgb(0 0 0 / 8%);
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

type Props = {
  value: string;
  resolvedAddress?: string | null;
  isAddressInvalid: boolean;
  resolvedNames: ResolveUsernameResponce[];
  onResolvedNameClick: (props: any) => void;
  onChange: (publicKey: string) => void;
};

export const ToAddressInput: FunctionComponent<Props> = ({
  value,
  resolvedAddress,
  isAddressInvalid = false,
  resolvedNames = [],
  onResolvedNameClick,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isResolvedNamesListOpen, setIsResolvedNamesListOpen] = useState(false);

  useEffect(() => {
    if (resolvedNames.length > 1) {
      setIsResolvedNamesListOpen(true);
    } else {
      setIsResolvedNamesListOpen(false);
    }
  }, [resolvedNames.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value.trim();

    onChange(nextValue);
  };

  const handleItemClick = (params: any) => () => {
    setIsResolvedNamesListOpen(false);
    onResolvedNameClick(params);
  };

  return (
    <WrapperLabel>
      <IconWrapper className={classNames({ isFocused })}>
        {resolvedAddress || (!isAddressInvalid && value.length > 40) ? (
          <WalletIcon name="home" />
        ) : (
          <SearchIcon name="search" />
        )}
      </IconWrapper>
      <AddressWrapper>
        <ToInput
          className={classNames({ isAddressResolved: resolvedAddress, hasError: isAddressInvalid })}
          placeholder="Username / SOL address"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {resolvedAddress ? <AddressText address={resolvedAddress} small gray /> : undefined}
        {!isResolvedNamesListOpen && isAddressInvalid ? (
          <Error>There’s no address like this</Error>
        ) : undefined}
        {isResolvedNamesListOpen ? (
          <ResolvedNamesList>
            {resolvedNames.map((item: any) => (
              <ResolvedNamesItem
                key={item.name}
                onClick={handleItemClick({
                  address: item.owner,
                  name: item.name,
                })}>
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
