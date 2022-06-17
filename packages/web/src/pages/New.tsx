import type { FC } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { HomeViewModel } from 'new/scenes/Main/Home';
import { Defaults } from 'new/services/Defaults';
import { SDFetcherState } from 'new/viewmodels/SDViewModel';
import { useViewModel } from 'new/viewmodels/useViewModel';
import { formatNumberTo, formatNumberToUSD } from 'utils/format';

const Wrapper = styled.div``;

interface Props {}

export const New: FC<Props> = observer((props) => {
  const vm = useViewModel<HomeViewModel>(HomeViewModel);

  useEffect(() => {
    vm.walletsRepository.reload();
  }, []);

  return (
    <Wrapper>
      <div>{vm.balance}</div>

      {vm.walletsRepository.state}
      {vm.walletsRepository.state === SDFetcherState.loading && 'loading'}
      {vm.walletsRepository.state === SDFetcherState.loaded && (
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
            {vm.walletsRepository
              .getWallets()
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
                      <button onClick={() => vm.walletsRepository.toggleWalletVisibility(wallet)}>
                        Hide
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            <tr>
              <td colSpan={6}>
                <button onClick={vm.walletsRepository.toggleIsHiddenWalletShown}>
                  {!vm.walletsRepository.isHiddenWalletsShown ? 'Show' : 'Hide'} hidden
                </button>
              </td>
            </tr>
            {vm.walletsRepository.isHiddenWalletsShown &&
              vm.walletsRepository
                .getWallets()
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
                      <button onClick={() => vm.walletsRepository.toggleWalletVisibility(wallet)}>
                        Show
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </Wrapper>
  );
});
