import { createContext, useState, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const defaultUser = {
    id: 'user123',
    name: 'Demo Admin',
    role: 'admin',
    email: 'admin@demo.com',
  };

  const [user] = useState(defaultUser);

  const value = useMemo(() => ({ user }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
