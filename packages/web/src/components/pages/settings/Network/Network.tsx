import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { useWallet } from '@p2p-wallet-web/core';
import { rgba } from 'polished';

import { WidgetPage } from 'components/common/WidgetPage';
import { RadioButton } from 'components/ui';
import type { NetworkObj } from 'config/constants';
import { NETWORKS } from 'config/constants';
import { trackEvent } from 'utils/analytics';

// const URL_REGEX = new RegExp(
//   /https?:\/\/(?:w{1,3}\.)?[^\s.]+(?:\.[a-z]+)*(?::\d+)?((?:\/\w+)|(?:-\w+))*\/?(?![^<]*(?:<\/\w+>|\/?>))/,
// );

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

// const AddCustomUrlWrapper = styled.div`
//   padding: 20px;
// `;
//
// const AddUrlWrapper = styled.div``;
//
// const Text = styled.div`
//   margin-bottom: 16px;
//
//   color: #a3a5ba;
//   font-weight: 600;
//   font-size: 16px;
// `;
//
// const Buttons = styled.div`
//   padding: 24px 0 0;
//
//   button:first-child {
//     margin-right: 10px;
//   }
// `;

export const Network: FunctionComponent = () => {
  // const [isOpenAddUrl, setIsOpenAddUrl] = useState(false);
  // const [customUrl, setCustomUrl] = useState('');
  const { endpoint, setEndpoints, setNetwork } = useWallet();

  const handleChange = (value: NetworkObj) => {
    trackEvent('settings_network_click', { endpoint: value.endpoint });

    setNetwork(value.network);
    setEndpoints({
      endpoint: value.endpoint,
      endpointWs: value.wsEndpoint,
    });
  };

  const renderClustersRadioButtons = () =>
    Object.values(NETWORKS).map((networkItem) => {
      return (
        <RadioButtonItem key={networkItem.name}>
          <RadioButton
            label={networkItem.endpointLabel || networkItem.endpoint}
            value={networkItem}
            checked={networkItem.endpoint === endpoint}
            onChange={handleChange}
          />
        </RadioButtonItem>
      );
    });

  // const renderCustomClustersRadioButtons = () => {
  //   const { custom } = network;
  //
  //   if (!custom) {
  //     return null;
  //   }
  //
  //   return Object.entries(custom).map((entry) => {
  //     const [key, url] = entry;
  //     return (
  //       <RadioButtonItem key={key}>
  //         <RadioButton
  //           label={url}
  //           value={key}
  //           checked={key === network.current}
  //           onChange={handleChange}
  //         />
  //       </RadioButtonItem>
  //     );
  //   });
  // };

  // const handleOpenAddUrl = () => {
  //   setIsOpenAddUrl(!isOpenAddUrl);
  // };
  //
  // const handleCustomUrl = (value: string) => {
  //   setCustomUrl(value);
  // };

  // const handleSaveButtonClick = () => {
  //   const newSettings = mergeDeepRight(network, {
  //     custom: { [`custom-${new Date().getTime()}`]: customUrl },
  //   });
  //
  //   dispatch(updateSettings({ network: newSettings }));
  //   setCustomUrl('');
  //   setIsOpenAddUrl(!isOpenAddUrl);
  // };

  // const handleCloseButton = () => {
  //   setCustomUrl('');
  //   setIsOpenAddUrl(!isOpenAddUrl);
  // };

  return (
    <WidgetPage icon="branch" title="Network">
      <RadioButtonsWrapper>
        <>
          {renderClustersRadioButtons()}
          {/* {renderCustomClustersRadioButtons()} */}
        </>
      </RadioButtonsWrapper>
      {/*<AddCustomUrlWrapper>*/}
      {/*  {isOpenAddUrl ? (*/}
      {/*    <AddUrlWrapper>*/}
      {/*      <Text>*/}
      {/*        If you are a developer you can add your node address for test or as a main working*/}
      {/*        node in a wallet.*/}
      {/*      </Text>*/}
      {/*      <Input name="customUrl" value={customUrl} onChange={handleCustomUrl} />*/}
      {/*      <Buttons>*/}
      {/*        <Button primary disabled={!URL_REGEX.test(customUrl)} onClick={handleSaveButtonClick}>*/}
      {/*          Save*/}
      {/*        </Button>*/}
      {/*        <Button light onClick={handleCloseButton}>*/}
      {/*          Cancel*/}
      {/*        </Button>*/}
      {/*      </Buttons>*/}
      {/*    </AddUrlWrapper>*/}
      {/*  ) : (*/}
      {/*    <Button light onClick={handleOpenAddUrl}>*/}
      {/*      + Add custom URL*/}
      {/*    </Button>*/}
      {/*  )}*/}
      {/*</AddCustomUrlWrapper>*/}
    </WidgetPage>
  );
};
