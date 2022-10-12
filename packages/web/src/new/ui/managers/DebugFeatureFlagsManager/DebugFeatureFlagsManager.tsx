import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Features } from 'new/services/FeatureFlags/features';
import { DebugFeatureFlagsManagerViewModel } from 'new/ui/managers/DebugFeatureFlagsManager/DebugFeatureFlagsManager.ViewModel';

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;

  z-index: 9999;

  display: flex;
  flex-direction: column;

  width: 300px;
  height: 300px;

  overflow-y: scroll;

  background-color: ${theme.colors.stroke.secondary};

  border: 1px solid ${theme.colors.bg.buttonDisabled};
  border-radius: 20px;

  opacity: 0.95;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 15px 15px;

  cursor: pointer;

  &.delimited {
    border-bottom: 1px solid ${theme.colors.stroke.primary};
  }

  & * {
    cursor: pointer;
  }

  &.disabled,
  &.disabled * {
    cursor: default;
  }

  & label {
    margin: auto 0;

    font-size: 18px;
  }

  &.disabled label {
    color: ${theme.colors.stroke.primary};
  }

  & input {
    width: 18px;
    height: 18px;
    margin: auto 0;
  }

  &.italic label {
    font-style: italic;
  }

  &.bold label {
    font-weight: bold;
  }
`;

const FlagRow = ({
  label,
  checked,
  onClick,
  disabled,
  className = '',
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <Row onClick={onClick} className={classNames({ disabled, [className]: true })}>
      <label>{label}</label>
      <input id={label} type="checkbox" checked={checked} disabled={disabled} readOnly={true} />
    </Row>
  );
};

export const DebugFeatureFlagsManager: FC = observer(() => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isShown, setIsShown] = useState(false);
  const viewModel = useViewModel(DebugFeatureFlagsManagerViewModel);

  const handleAwayClick = (e: MouseEvent) => {
    if (!wrapperRef.current?.contains(e.target as HTMLDivElement)) {
      setIsShown(false);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    // Ctrl + I
    if (e.ctrlKey && e.which === 73) {
      setIsShown((shown) => !shown);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('click', handleAwayClick);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleDebugFeatureFlagsOn = () => {
    viewModel.setDebugFeatureFlagsOn(!viewModel.isOn);
  };

  const handleFeatureClick = (feature: Features) => {
    viewModel.setDebugFeatureFlag(feature, !viewModel.featureFlags[feature]);
  };

  if (!isShown) {
    return null;
  }

  return (
    <Wrapper ref={wrapperRef}>
      <FlagRow
        label={'Turn on Debug flags'}
        checked={viewModel.isOn}
        onClick={handleDebugFeatureFlagsOn}
        className={'bold delimited'}
      />
      {Object.entries(Features).map(([key, value]) => (
        <FlagRow
          key={key}
          label={key}
          checked={viewModel.featureFlags[value as Features]}
          onClick={() => handleFeatureClick(value)}
          disabled={!viewModel.isOn}
        />
      ))}
    </Wrapper>
  );
});
