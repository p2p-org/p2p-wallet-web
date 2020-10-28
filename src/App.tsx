import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { styled } from 'linaria/react';

import { Access, Create, Dashboard, Home } from 'pages';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 960px;
`;

export const App: React.FC = () => {
  return (
    <Wrapper>
      <Container>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/access" element={<Access />} />
            <AuthRequiredRoute path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </Container>
    </Wrapper>
  );
};
