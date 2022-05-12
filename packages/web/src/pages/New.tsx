import type { FC } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/viewmodels/useViewModel';
import { WalletsViewModel } from 'new/viewmodels/WalletsViewModel';

const Wrapper = styled.div``;

interface Props {}

export const New: FC<Props> = observer((props) => {
  const vm = useViewModel<WalletsViewModel>(WalletsViewModel);

  console.log(vm.isInitialized);
  console.log(vm.tokens);

  return (
    <Wrapper>
      {vm.tokens.map((token) => (
        <div>{token.pubkey.toString()}</div>
      ))}
    </Wrapper>
  );
});
