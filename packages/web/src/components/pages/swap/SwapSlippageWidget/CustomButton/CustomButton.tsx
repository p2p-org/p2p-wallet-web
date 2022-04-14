import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui/Icon';

import { ButtonStyled } from '../common/styled';
import { SlippageInput } from '../SlippageInput';

const CustomButtonTitle = styled.div`
  display: flex;
`;

const PenIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  margin: auto 4px auto 0;
`;

interface Props {
  isCustomSlippageValue: boolean;
  slippageValue: string;
  maxSlippage: number;
  onClick: () => void;
  onValueChange: (value: string) => void;
}

export const CustomButton: FC<Props> = ({
  isCustomSlippageValue,
  slippageValue,
  maxSlippage,
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
    <ButtonStyled
      className={classNames('custom', {
        active: isCustomInputShown || isCustomSlippageValue,
        editing: isCustomInputShown,
      })}
      onClick={handleClick}
    >
      {isCustomInputShown ? (
        <SlippageInput
          onChangeValue={handleCustomInputChange}
          deafultValue={isCustomSlippageValue ? slippageValue : ''}
          maxSlippage={maxSlippage}
        />
      ) : (
        <CustomButtonTitle>
          {isCustomSlippageValue ? (
            <>
              <PenIcon name="pen" />
              {slippageValue}%
            </>
          ) : (
            'Custom'
          )}
        </CustomButtonTitle>
      )}
    </ButtonStyled>
  );
};
