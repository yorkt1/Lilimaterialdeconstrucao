import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const ADMIN_EMAILS = ['guilherme.roucha@gmail.com', 'charguioliveira@gmail.com'];

const AuthContext = createContext({
  user: null,
  session: null,
  isAdmin: false,
  isLoadingAuth: true,
  isLoadingPublicSettings: false,
  authError: null,
  navigateToLogin: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Carrega a sessão ativa ao montar
    const initAuth = async () => {
      try {
        const activeSession = await api.auth.getSession();
        setSession(activeSession ?? null);
        setUser(activeSession?.user ?? null);
        setIsAdmin(ADMIN_EMAILS.includes(activeSession?.user?.email));
      } catch (err) {
        console.error('Auth init error:', err);
        setAuthError({ type: 'auth_error', message: err.message });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    // Escuta mudanças de sessão em tempo real (login, logout, refresh de token)
    const { data: authListener } = api.auth.onAuthStateChange((event, activeSession) => {
      setSession(activeSession ?? null);
      setUser(activeSession?.user ?? null);
      setIsAdmin(ADMIN_EMAILS.includes(activeSession?.user?.email));
      setIsLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const logout = async () => {
    await api.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        navigateToLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
