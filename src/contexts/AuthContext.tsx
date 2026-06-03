import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserInfo {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'ayudante' | 'supervisor' | 'usuario';
  aceptoTratamientoDatos?: boolean;
}

interface AuthContextType {
  user: UserInfo | null;
  login: (user: UserInfo) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserInfo>) => void;
  isAdmin: boolean;
  isAyudante: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isAdmin: false,
  isAyudante: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (user: UserInfo) => {
    setUser(user);
    sessionStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<UserInfo>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAdmin: user?.rol === 'admin',
        isAyudante: user?.rol === 'ayudante',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
