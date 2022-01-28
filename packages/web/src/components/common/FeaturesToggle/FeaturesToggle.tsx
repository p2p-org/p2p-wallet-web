import type { FC } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';

import { useFeatureFlags } from 'app/contexts';

import { Card } from '../Card';

const WrapperCard = styled(Card)`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;

  margin: 20px;
  padding: 0;
`;

const Label = styled.label`
  display: flex;
  align-items: center;

  padding: 16px 20px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;

  cursor: pointer;

  &:hover {
    color: #5887ff;
  }
`;

const Input = styled.input`
  margin-left: 10px;

  cursor: pointer;
`;

export const FeaturesToggle: FC = memo(() => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { featureFlagsEnabled, setFeatureFlagsEnabled } = useFeatureFlags();
  const [isShow, setShow] = useState(false);

  const handleOnKeyUp = (e: KeyboardEvent) => {
    // Ctrl + I
    if (e.ctrlKey && e.which === 73) {
      setShow((state) => !state);
    }
  };

  const handleAwayClick = (e: MouseEvent) => {
    if (!cardRef.current?.contains(e.target as HTMLDivElement)) {
      setShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);
    document.addEventListener('keyup', handleOnKeyUp);

    return () => {
      window.removeEventListener('click', handleAwayClick);
      document.removeEventListener('keyup', handleOnKeyUp);
    };
  }, []);

  if (!isShow) {
    return null;
  }

  const handleToggleFeatures = () => {
    setFeatureFlagsEnabled(!featureFlagsEnabled);
  };

  return (
    <WrapperCard ref={cardRef}>
      <Label>
        Turn on all{' '}
        <Input type="checkbox" checked={featureFlagsEnabled} onChange={handleToggleFeatures} />
      </Label>
    </WrapperCard>
  );
});
