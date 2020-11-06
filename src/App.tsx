import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Access, Create, Dashboard, DashboardOld, Home } from 'pages';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

export const App: React.FC = () => {
  return (
    <Router basename={process.env.BASENAME || ''}>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/create" component={Create} />
        <Route path="/access" component={Access} />
        <AuthRequiredRoute path="/dashboard" element={<Dashboard />} />
        <AuthRequiredRoute path="/dashboard_old" element={<DashboardOld />} />
      </Switch>
    </Router>
  );
};
