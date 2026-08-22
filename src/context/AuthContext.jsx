import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'karcix-auth-user';

export const DEMO_ACCOUNTS = {
  customer: {
    id: 'usr-cust-001',
    name: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    role: 'customer',
    roleLabel: 'Pembeli',
  },
  admin: {
    id: 'usr-adm-001',
    name: 'Bima Administrator',
    email: 'admin@karcix.id',
    role: 'admin',
    roleLabel: 'Admin Sistem',
  },
  promotor: {
    id: 'usr-prm-001',
    name: 'Maya Promotor',
    email: 'promotor@karcix.id',
    role: 'promotor',
    roleLabel: 'Promotor Event',
  },
  gate: {
    id: 'usr-gte-001',
    name: 'Rudi Petugas Gate',
    email: 'gate@karcix.id',
    role: 'gate',
    roleLabel: 'Petugas Pintu Masuk',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      // Sinkronkan juga session key staff jika login sebagai admin/promotor/gate
      if (currentUser.role && currentUser.role !== 'customer') {
        localStorage.setItem(`karcix-staff-${currentUser.role}`, 'true');
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (userData) => {
    setCurrentUser(userData);
  };

  const loginAsDemo = (type) => {
    const acc = DEMO_ACCOUNTS[type] || DEMO_ACCOUNTS.customer;
    setCurrentUser(acc);
    return acc;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    loginAsDemo,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
