import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Icon } from 'components/ui';
import { Popover } from 'components/ui/Popover';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import type { ViewModelProps } from '../../typings';
import { DERIVATION_PATH } from '../../utils';
import { Button } from '../components/Button';
import type { SelectorItemType } from './Selector';
import { Selector } from './Selector';
import { WalletPlaceholder } from './WalletPlaceholder';
import { WalletRow } from './WalletRow';

const Wrapper = styled.div`
  position: relative;

  margin-top: 32px;
`;

const SubTitle = styled.div`
  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SelectDerivationPath = styled(SubTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CloseWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  background: #f6f6f8;
  border-radius: 4px;
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;

  color: #161616;
`;

const QuestionIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const PopoverContent = styled.div`
  width: 328px;
`;

const Derivable = styled(SubTitle)`
  margin: 24px 0 0;
`;

const AccountsWrapper = styled.div`
  margin: 8px 0 22px;
`;

const DERIVATION_PATHS_WITH_LABELS: SelectorItemType[] = [
  {
    label: `m/44'/501'/0'`,
    value: DERIVATION_PATH.Bip44,
  },
  {
    label: `m/44'/501'/0'/0'`,
    value: DERIVATION_PATH.Bip44Change,
  },
  {
    label: `m/501'/0'/0/0 (deprecated)`,
    value: DERIVATION_PATH.Deprecated,
  },
];

export const DerivableAccounts: FC<ViewModelProps> = observer(({ authViewModel }) => {
  return (
    <Wrapper>
      <SelectDerivationPath>
        Select Derivation Path{' '}
        <Popover
          button={(isShow) =>
            isShow ? (
              <CloseWrapper>
                <CloseIcon name="close" />
              </CloseWrapper>
            ) : (
              <QuestionIcon name="question-circle" />
            )
          }
        >
          <PopoverContent>
            By default, P2P wallet will use m/44&apos;/501&apos;/0&apos;/0&apos; as the derivation
            path for the main wallet. To use an alternative path, try restoring an existing wallet.
          </PopoverContent>
        </Popover>
      </SelectDerivationPath>
      <Selector
        value={authViewModel.authInfo.derivationPath}
        items={DERIVATION_PATHS_WITH_LABELS}
        onChange={authViewModel.setDerivationPath}
      />

      <Derivable>Derivable Accounts</Derivable>
      <AccountsWrapper>
        <StaticSectionsCollectionView<Wallet>
          viewModel={authViewModel.walletListsViewModel}
          renderPlaceholder={(key) => <WalletPlaceholder key={key} />}
          renderItem={(wallet) => <WalletRow wallet={wallet} key={wallet.pubkey} />}
        />
      </AccountsWrapper>

      <Button onClick={authViewModel.nextStep}>Continue</Button>
    </Wrapper>
  );
});
