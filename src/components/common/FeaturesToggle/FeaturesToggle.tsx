import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { setFeatureFlagsAction, STORAGE_KEY_FEATURES_FLAGS } from 'store/slices/GlobalSlice';

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
  const dispatch = useDispatch();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isShow, setShow] = useState(false);
  const featureFlagsEnabled = useSelector((state) => state.global.featureFlagsEnabled);

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
    localStorage.setItem(STORAGE_KEY_FEATURES_FLAGS, String(!featureFlagsEnabled));
    dispatch(setFeatureFlagsAction(!featureFlagsEnabled));
  };

  return (
    <WrapperCard ref={cardRef} withShadow>
      <Label>
        Turn on all{' '}
        <Input type="checkbox" checked={featureFlagsEnabled} onChange={handleToggleFeatures} />
      </Label>
    </WrapperCard>
  );
});
