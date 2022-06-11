import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { Defaults } from 'new/services/Defaults';
import { useViewModel } from 'new/viewmodels/useViewModel';
import { WalletsViewModel } from 'new/viewmodels/WalletsViewModel';
import { formatNumberTo, formatNumberToUSD } from 'utils/format';

const Wrapper = styled.div``;

interface Props {}

export const New: FC<Props> = observer((props) => {
  const vm = useViewModel<WalletsViewModel>(WalletsViewModel);

  // console.log(vm.isInitialized);
  // console.log(vm.wallets);

  return (
    <Wrapper>
      <div>
        {Defaults.fiat.symbol}{' '}
        {vm.wallets.reduce((acc, wallet) => {
          return acc + wallet.amountInCurrentFiat;
        }, 0)}
      </div>

      {!vm.isInitialized && 'loading'}
      {vm.isInitialized && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Balance</th>
              <th>Amount</th>
              <th>Price</th>
              <th>CoingeckoId</th>
              <th>Show/Hide</th>
            </tr>
          </thead>
          <tbody>
            {vm.wallets
              .filter((wallet) => !wallet.isHidden)
              .map((wallet) => (
                <tr key={wallet.pubkey.toString()}>
                  <td>{wallet.token.name}</td>
                  <td>{wallet.amount?.formatUnits()}</td>
                  <td>
                    {wallet.amountInCurrentFiat
                      ? formatNumberTo(Defaults.fiat.code, wallet.amountInCurrentFiat)
                      : null}
                  </td>
                  <td>
                    {wallet.price?.value ? `${Defaults.fiat.symbol} ${wallet.price?.value}` : null}
                  </td>
                  <td>{wallet.token.extensions?.coingeckoId}</td>
                  <td>
                    {!wallet.isNativeSOL ? (
                      <button onClick={() => vm.toggleWalletVisibility(wallet)}>Hide</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            <tr>
              <td colSpan={6}>
                <button onClick={vm.toggleIsHiddenWalletShown}>
                  {!vm.isHiddenWalletsShown ? 'Show' : 'Hide'} hidden
                </button>
              </td>
            </tr>
            {vm.isHiddenWalletsShown &&
              vm.wallets
                .filter((wallet) => wallet.isHidden)
                .map((wallet) => (
                  <tr key={wallet.pubkey.toString()}>
                    <td>{wallet.token.name}</td>
                    <td>{wallet.amount?.formatUnits()}</td>
                    <td>
                      {wallet.amountInCurrentFiat
                        ? formatNumberToUSD(wallet.amountInCurrentFiat)
                        : null}
                    </td>
                    <td>
                      {wallet.price?.value
                        ? `${Defaults.fiat.symbol} ${wallet.price?.value}`
                        : null}
                    </td>
                    <td>{wallet.token.extensions?.coingeckoId}</td>
                    <td>
                      <button onClick={() => vm.toggleWalletVisibility(wallet)}>Show</button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </Wrapper>
  );
});
