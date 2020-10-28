import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Box = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  max-width: 300px;
`;

export const Home: FunctionComponent = () => {
  return (
    <Wrapper>
      <Box>
        <Link to="/create">Create Wallet</Link> <Link to="/access">Access Wallet</Link>
      </Box>
    </Wrapper>
  );
};
