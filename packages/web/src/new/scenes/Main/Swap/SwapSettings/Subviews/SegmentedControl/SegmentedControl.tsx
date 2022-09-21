import type { FC } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { expr } from 'mobx-utils';

import { SlippageType, SlippageTypeType } from '../../model/SwapSettings.SlippageType';
import type { SwapSettingsViewModel } from '../../SwapSettings.ViewModel';
import { ButtonStyled } from '../common/styled';
import { CustomSlippageButton } from './CustomSlippageButton';

const Wrapper = styled.div`
  display: grid;
  grid-column-gap: 6px;
  grid-template-columns: repeat(5, 1fr);
`;

interface Props {
  viewModel: Readonly<SwapSettingsViewModel>;
}

// @web: this component use strange logic at first sight, but it's done for case
// if we will do interface like ios
export const SegmentedControl: FC<Props> = observer(({ viewModel }) => {
  const items = viewModel.possibleSlippageTypes;
  const selectedItem = viewModel.slippageType;
  const onClick = (selectedSlippage: SlippageType) => {
    viewModel.slippageSelected(selectedSlippage);
  };
  const selectedSegmentIndex = expr(() =>
    items.findIndex((item) => item.type === selectedItem.type),
  );

  const handleCustomSlippageButtonClick = () => {
    viewModel.slippageSelected(SlippageType.custom(null));
  };
  const handleCustomSlippageValueChange = (value: string) => {
    viewModel.customSlippageChanged(Number(value));
  };

  const slippageValue = expr(() => {
    switch (selectedItem.type) {
      case SlippageTypeType.custom:
        return selectedItem.value ? (selectedItem.value * 100).toString() : '';
      default:
        return '';
    }
  });

  return (
    <Wrapper>
      {items.map((value, index) => (
        <ButtonStyled
          key={index}
          className={classNames({
            active: !viewModel.customSlippageIsOpened && selectedSegmentIndex === index,
          })}
          onClick={() => onClick(value)}
        >
          {value.description}
        </ButtonStyled>
      ))}
      <CustomSlippageButton
        customSlippageIsOpened={viewModel.customSlippageIsOpened}
        slippageValue={slippageValue}
        onClick={handleCustomSlippageButtonClick}
        onValueChange={handleCustomSlippageValueChange}
      />
    </Wrapper>
  );
});
