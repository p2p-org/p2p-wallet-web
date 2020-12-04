import { styled } from '@linaria/react';

export const ButtonsGroup = styled.div`
  > :first-child {
    margin-right: 1px;

    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  > :last-child {
    margin-left: 1px;

    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  > :not(:first-child):not(:last-child) {
    margin: 0 1px;

    border-radius: 0;
  }
`;
