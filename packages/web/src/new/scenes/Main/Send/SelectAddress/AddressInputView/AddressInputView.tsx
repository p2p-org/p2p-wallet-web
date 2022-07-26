import type { FC } from 'react';
import { useRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useDebouncedCallback } from 'use-debounce';

import { Icon } from 'components/ui';
import type { SelectAddressViewModel } from 'new/scenes/Main/Send/SelectAddress/SelectAddress.ViewModel';

const Wrapper = styled.div`
  display: flex;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: ${theme.colors.bg.secondary};
  border-radius: 12px;

  &.isFocused {
    background: ${theme.colors.bg.activePrimary};
    border: 1px solid ${theme.colors.textIcon.active};
  }
`;

const SearchIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

const ToInput = styled.input`
  flex: 1;
  margin-left: 12px;

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
  border: 1px solid ${theme.colors.stroke.primary};
  border-radius: 8px;
  cursor: pointer;
`;

const ClearIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.active};
`;

interface Props {
  viewModel: Readonly<SelectAddressViewModel>;
}

export const AddressInputView: FC<Props> = observer(({ viewModel }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    viewModel.search(value);
  }, 300);

  const handleClear = () => {
    viewModel.clearSearching();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Wrapper>
      <IconWrapper className={classNames({ isFocused })}>
        <SearchIcon name="search" />
      </IconWrapper>
      <ToInput
        ref={inputRef}
        placeholder="Username / SOL address"
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // className={classNames({
        //   isAddressResolved: resolvedAddress,
        //   hasError: isAddressInvalid,
        // })}
      />
      <ClearWrapper onClick={handleClear}>
        <ClearIcon name="cross" />
      </ClearWrapper>
    </Wrapper>
  );
});
