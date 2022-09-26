import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';
import classNames from 'classnames';

import { Icon } from 'components/ui';

import { ButtonStyled } from '../../common/styled';
import { SlippageInput } from './SlippageInput';

const CustomButtonStyled = styled(ButtonStyled)`
  &.custom {
    width: 69px;

    ${up.tablet} {
      width: 93px;
    }

    &.active {
      background-color: inherit;
    }
  }

  &.custom.active.editing {
    padding: 0 10px;

    ${up.tablet} {
      padding: 0 20px;
    }
  }
`;

const CustomButtonTitle = styled.div`
  display: flex;
`;

const PenIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin: auto 4px auto 0;
`;

interface Props {
  customSlippageIsOpened: boolean;
  slippageValue: string;
  onClick: () => void;
  onValueChange: (value: string) => void;
}

export const CustomSlippageButton: FC<Props> = ({
  customSlippageIsOpened,
  slippageValue,
  onClick,
  onValueChange,
}) => {
  const [isCustomInputShown, setIsCustomInputShown] = useState(false);

  const handleClick = () => {
    setIsCustomInputShown(true);
    onClick();
  };

  const handleCustomInputChange = (value: string) => {
    setIsCustomInputShown(false);
    onValueChange(value);
  };

  return (
    <CustomButtonStyled
      className={classNames('custom', {
        active: isCustomInputShown || customSlippageIsOpened,
        editing: isCustomInputShown,
      })}
      onClick={handleClick}
    >
      {isCustomInputShown ? (
        <SlippageInput
          onChangeValue={handleCustomInputChange}
          defaultValue={customSlippageIsOpened ? slippageValue : ''}
        />
      ) : (
        <CustomButtonTitle>
          {customSlippageIsOpened ? (
            <>
              <PenIcon name="pen" />
              {slippageValue}%
            </>
          ) : (
            'Custom'
          )}
        </CustomButtonTitle>
      )}
    </CustomButtonStyled>
  );
};
