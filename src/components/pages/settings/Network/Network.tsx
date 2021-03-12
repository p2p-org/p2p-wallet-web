import React, { FunctionComponent, useEffect, useState } from 'react';
import { batch, useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import { Cluster } from '@solana/web3.js';
import { rgba } from 'polished';
import { mergeDeepRight } from 'ramda';

import { WidgetPage } from 'components/common/WidgetPage';
import { Button, Input, RadioButton } from 'components/ui';
import { wipeAction } from 'store/slices/GlobalSlice';
import { autoConnect, selectCluster } from 'store/slices/wallet/WalletSlice';
import { clusters, defaultSettings, loadSettings, saveSettings } from 'utils/settings';

const URL_REGEX = new RegExp(
  /https?:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?((?:\/\w+)|(?:-\w+))*\/?(?![^<]*(?:<\/\w+>|\/?>))/,
);

const RadioButtonsWrapper = styled.div`
  position: relative;

  padding: 0 10px;
`;

const RadioButtonItem = styled.div`
  position: relative;

  margin-top: 6px;
  margin-bottom: 12px;
  padding: 14px 18px;

  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: #f6f6f8;
  }

  &::after {
    position: absolute;
    right: 10px;
    bottom: -6px;
    left: 10px;

    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

    content: '';
  }
`;

const AddCustomUrlWrapper = styled.div`
  padding: 20px;
`;

const AddUrlWrapper = styled.div``;

const Text = styled.div`
  margin-bottom: 16px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
`;

const Buttons = styled.div`
  padding: 24px 0 0;

  button:first-child {
    margin-right: 10px;
  }
`;

export const Network: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState(defaultSettings);
  const [isOpenAddUrl, setIsOpenAddUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const mount = async () => {
      const currentSetting = loadSettings();
      setSettings(currentSetting);
    };
    void mount();
  }, []);

  const handleChange = (value: string) => {
    const newSettings = mergeDeepRight(settings, {
      network: { current: value },
    });

    setSettings(newSettings);
    saveSettings(newSettings);

    batch(async () => {
      dispatch(selectCluster(value as Cluster));
      dispatch(wipeAction());
      await dispatch(autoConnect());
    });
  };

  const renderClustersRadioButtons = () =>
    Object.entries(clusters).map((entry) => {
      const [key, url] = entry;
      return (
        <RadioButtonItem key={key}>
          <RadioButton
            label={url}
            value={key}
            checked={key === settings.network.current}
            onChange={handleChange}
          />
        </RadioButtonItem>
      );
    });

  const renderCustomClustersRadioButtons = () => {
    const { custom } = settings.network;

    if (!custom) {
      return null;
    }

    return Object.entries(custom).map((entry) => {
      const [key, url] = entry;
      return (
        <RadioButtonItem key={key}>
          <RadioButton
            label={url}
            value={key}
            checked={key === settings.network.current}
            onChange={handleChange}
          />
        </RadioButtonItem>
      );
    });
  };

  const handleOpenAddUrl = () => {
    setIsOpenAddUrl(!isOpenAddUrl);
  };

  const handleCustomUrl = (value: string) => {
    setCustomUrl(value);
  };

  const handleSaveButtonClick = () => {
    const newSettings = mergeDeepRight(settings, {
      network: { custom: { [`custom-${new Date().getTime()}`]: customUrl } },
    });

    setSettings(newSettings);
    saveSettings(newSettings);
    setCustomUrl('');
    setIsOpenAddUrl(!isOpenAddUrl);
  };

  const handleCloseButton = () => {
    setCustomUrl('');
    setIsOpenAddUrl(!isOpenAddUrl);
  };

  return (
    <WidgetPage icon="branch" title="Network">
      <RadioButtonsWrapper>
        <>
          {renderClustersRadioButtons()}
          {renderCustomClustersRadioButtons()}
        </>
      </RadioButtonsWrapper>
      <AddCustomUrlWrapper>
        {isOpenAddUrl ? (
          <AddUrlWrapper>
            <Text>
              If you are a developer you can add your node address for test or as a main working
              node in a wallet.
            </Text>
            <Input name="customUrl" value={customUrl} onChange={handleCustomUrl} />
            <Buttons>
              <Button primary disabled={!URL_REGEX.test(customUrl)} onClick={handleSaveButtonClick}>
                Save
              </Button>
              <Button light onClick={handleCloseButton}>
                Cancel
              </Button>
            </Buttons>
          </AddUrlWrapper>
        ) : (
          <Button light onClick={handleOpenAddUrl} style={{ display: 'none' }}>
            + Add custom URL
          </Button>
        )}
      </AddCustomUrlWrapper>
    </WidgetPage>
  );
};
