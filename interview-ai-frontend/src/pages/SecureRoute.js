import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Navigate } from 'react-router-dom';

const SecureRoute = ({ element }) => {
  const { authState } = useOktaAuth();

  if (!authState) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return authState.isAuthenticated ? element : <Navigate to="/" />;
};

export default SecureRoute;