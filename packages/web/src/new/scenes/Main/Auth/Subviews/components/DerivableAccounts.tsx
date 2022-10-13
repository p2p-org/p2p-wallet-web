import type { FC } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { DERIVATION_PATH } from '@p2p-wallet-web/core';
import { observer } from 'mobx-react-lite';

// import { TokenAccountRow } from 'components/common/TokenAccountRow';
import { Button } from 'components/pages/auth/AuthSide/common/Button';
import { Icon } from 'components/ui';
import { Popover } from 'components/ui/Popover';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { AuthViewModel } from 'new/scenes/Main/Auth/Auth.ViewModel';
import { WalletPlaceholder } from 'new/scenes/Main/Auth/Subviews/components/WalletPlaceholder';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

import type { SelectorItemType } from './Selector';
import { Selector } from './Selector';

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

// const TokenAccountRowStyled = styled(TokenAccountRow)`
//   padding-right: 0;
//   padding-left: 0;
// `;

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

export const DerivableAccounts: FC = observer(() => {
  const viewModel = useViewModel(AuthViewModel);

  useEffect(() => {
    viewModel.seed.then((seedString) => {
      viewModel.walletListsViewModel.fetchWallets({
        seed: seedString,
        derivationPathValue: viewModel.authInfo.derivationPath.value,
      });
    });
  }, []);

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
        value={viewModel.authInfo.derivationPath}
        items={DERIVATION_PATHS_WITH_LABELS}
        onChange={viewModel.setDerivationPath}
      />

      <Derivable>Derivable Accounts</Derivable>
      <AccountsWrapper>
        <StaticSectionsCollectionView<Wallet>
          viewModel={viewModel.walletListsViewModel}
          renderPlaceholder={(key) => <WalletPlaceholder key={key} />}
          renderItem={() => <p>item</p>}
        />
        {/*{viewModel.derivableAccounts.map((tokenAccount) => (*/}
        {/*  // <TokenAccountRowStyled*/}
        {/*  //   key={tokenAccount?.key?.toBase58()}*/}
        {/*  //   tokenAccount={tokenAccount}*/}
        {/*  //   showAddress*/}
        {/*  // />*/}
        {/*))}*/}
      </AccountsWrapper>

      <Button onClick={viewModel.nextStep}>Continue</Button>
    </Wrapper>
  );
});
