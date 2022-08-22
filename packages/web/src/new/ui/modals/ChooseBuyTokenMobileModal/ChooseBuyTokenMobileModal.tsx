import type { FC } from 'react';
import { useHistory, useLocation } from 'react-router';

import { observer } from 'mobx-react-lite';

import type { ModalPropsType } from 'app/contexts';
import { Modal } from 'components/ui/Modal';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { CryptoCurrency } from 'new/services/BuyService/structures';
import { ChooseBuyTokenMobileModalViewModel } from 'new/ui/modals/ChooseBuyTokenMobileModal/ChooseBuyTokenMobileModal.ViewModel';

import { ActionRow } from './ActionRow';

export const ChooseBuyTokenMobileModal: FC<ModalPropsType> = observer(({ close }) => {
  const history = useHistory();
  const location = useLocation();
  const { solWallet, solToken, usdcWallet, usdcToken } =
    useViewModel<ChooseBuyTokenMobileModalViewModel>(ChooseBuyTokenMobileModalViewModel);

  const handleCloseClick = () => {
    close(false);
  };

  const handleRowClick = (cryptoCurrency: CryptoCurrency) => {
    handleCloseClick();

    const newPath = `/buyNew/${cryptoCurrency.symbol}`;

    if (location.pathname !== newPath) {
      history.push(newPath);
    }
  };

  return (
    <Modal noDelimiter={false} close={handleCloseClick} title="Choose a crypto for buying">
      <ActionRow
        wallet={solWallet}
        token={solToken}
        onClick={() => handleRowClick(CryptoCurrency.sol)}
      />
      <ActionRow
        wallet={usdcWallet}
        token={usdcToken}
        onClick={() => handleRowClick(CryptoCurrency.usdc)}
      />
    </Modal>
  );
});
