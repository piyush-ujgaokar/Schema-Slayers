import React from 'react';
import { AuthProvider } from './application/context/AuthContext';
import AppRoutes from './application/routes/AppRoutes';

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
