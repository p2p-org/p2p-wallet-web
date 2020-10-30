import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

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
        <Router basename={process.env.BASENAME || ''}>
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/create" component={Create} />
            <Route path="/access" component={Access} />
            <AuthRequiredRoute path="/dashboard" element={<Dashboard />} />
          </Switch>
        </Router>
      </Container>
    </Wrapper>
  );
};
