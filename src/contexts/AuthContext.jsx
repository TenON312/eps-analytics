import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('eps-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUserData(authData.userData);
    }
    setLoading(false);
  }, []);

  const login = (employeeData) => {
    const authData = {
      userData: employeeData,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('eps-auth', JSON.stringify(authData));
    setIsAuthenticated(true);
    setUserData(employeeData);
  };

  const logout = () => {
    localStorage.removeItem('eps-auth');
    setIsAuthenticated(false);
    setUserData(null);
  };

  const value = {
    isAuthenticated,
    userData,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};