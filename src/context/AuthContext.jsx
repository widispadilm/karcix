import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchCustomersFromSupabase,
  createCustomerInSupabase,
  updateCustomerInSupabase,
  deleteCustomerInSupabase,
} from '../lib/supabaseSync';
import { isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'karcix-auth-user';
const CUSTOMERS_STORAGE_KEY = 'karcix-customers-v1';

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    whatsapp: '081234567890',
    password: 'password123',
    status: 'active',
    created_at: '2026-08-15T10:00:00+07:00',
  },
  {
    id: 'CUST-002',
    name: 'Siti Nurhaliza',
    email: 'siti.n@gmail.com',
    whatsapp: '081298765432',
    password: 'password123',
    status: 'active',
    created_at: '2026-08-15T10:30:00+07:00',
  },
  {
    id: 'CUST-003',
    name: 'Budi Santoso',
    email: 'budi.s@yahoo.com',
    whatsapp: '085678901234',
    password: 'password123',
    status: 'active',
    created_at: '2026-08-15T11:00:00+07:00',
  },
  {
    id: 'CUST-004',
    name: 'Dewi Lestari',
    email: 'dewi.l@outlook.com',
    whatsapp: '087812345678',
    password: 'password123',
    status: 'active',
    created_at: '2026-08-15T12:00:00+07:00',
  },
  {
    id: 'CUST-005',
    name: 'Rizky Febian',
    email: 'rizky.f@gmail.com',
    whatsapp: '081345678901',
    password: 'password123',
    status: 'active',
    created_at: '2026-08-15T13:00:00+07:00',
  },
];

export const DEMO_ACCOUNTS = {
  customer: {
    id: 'CUST-001',
    name: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    role: 'customer',
    roleLabel: 'Pembeli',
  },
  admin: {
    id: 'STAFF-ADM-001',
    name: 'Bima Administrator',
    email: 'admin@karcix.id',
    role: 'admin',
    roleLabel: 'Admin Sistem',
  },
  promotor: {
    id: 'STAFF-PRM-001',
    name: 'Maya Promotor',
    email: 'promotor@karcix.id',
    role: 'promotor',
    roleLabel: 'Promotor Event',
  },
  gate: {
    id: 'STAFF-GTE-001',
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

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Sync customers to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isMounted = true;
    fetchCustomersFromSupabase().then((data) => {
      if (data && data.length > 0 && isMounted) {
        setCustomers(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      if (currentUser.role && currentUser.role !== 'customer') {
        localStorage.setItem(`karcix-staff-${currentUser.role}`, 'true');
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  // Register a new customer
  const registerCustomer = useCallback(async ({ name, email, whatsapp, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = customers.find((c) => c.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.');
    }

    const newCustomer = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: cleanEmail,
      whatsapp: whatsapp.trim(),
      password: password || 'password123',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (isSupabaseConfigured) {
      createCustomerInSupabase(newCustomer).catch((err) =>
        console.error('Supabase customer create error:', err)
      );
    }

    const userSession = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      whatsapp: newCustomer.whatsapp,
      role: 'customer',
      roleLabel: 'Pembeli',
    };

    setCurrentUser(userSession);
    return userSession;
  }, [customers]);

  // Login customer with email and password
  const loginCustomer = useCallback(({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);

    if (!customer) {
      throw new Error('Akun dengan email ini belum terdaftar. Silakan daftar akun baru.');
    }

    if (customer.status === 'suspended') {
      throw new Error('Akun Anda sedang dinonaktifkan/diblokir oleh admin. Silakan hubungi pusat bantuan.');
    }

    if (password && customer.password && customer.password !== password) {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }

    const userSession = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      whatsapp: customer.whatsapp,
      role: 'customer',
      roleLabel: 'Pembeli',
    };

    setCurrentUser(userSession);
    return userSession;
  }, [customers]);

  // Direct login for staff or general user
  const login = useCallback((userData) => {
    setCurrentUser(userData);
  }, []);

  const loginAsDemo = useCallback((type) => {
    const acc = DEMO_ACCOUNTS[type] || DEMO_ACCOUNTS.customer;
    setCurrentUser(acc);
    return acc;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // Staff User Management actions
  const addCustomerByAdmin = useCallback(async (customerData) => {
    const cleanEmail = customerData.email.trim().toLowerCase();
    if (customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email sudah terdaftar.');
    }

    const newCustomer = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      name: customerData.name.trim(),
      email: cleanEmail,
      whatsapp: customerData.whatsapp.trim(),
      password: customerData.password || 'password123',
      status: customerData.status || 'active',
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    if (isSupabaseConfigured) {
      createCustomerInSupabase(newCustomer).catch((err) =>
        console.error('Supabase customer insert error:', err)
      );
    }
    return newCustomer;
  }, [customers]);

  const updateCustomerData = useCallback((customerId, updates) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates } : c))
    );

    if (isSupabaseConfigured) {
      updateCustomerInSupabase(customerId, updates).catch((err) =>
        console.error('Supabase customer update error:', err)
      );
    }
  }, []);

  const toggleCustomerStatus = useCallback((customerId) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const nextStatus = c.status === 'active' ? 'suspended' : 'active';
          if (isSupabaseConfigured) {
            updateCustomerInSupabase(customerId, { status: nextStatus }).catch((err) =>
              console.error('Supabase customer status toggle error:', err)
            );
          }
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  }, []);

  const resetCustomerPassword = useCallback((customerId, newPassword) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, password: newPassword || 'password123' } : c
      )
    );

    if (isSupabaseConfigured) {
      updateCustomerInSupabase(customerId, { password: newPassword || 'password123' }).catch(
        (err) => console.error('Supabase customer reset password error:', err)
      );
    }
  }, []);

  const deleteCustomer = useCallback((customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (isSupabaseConfigured) {
      deleteCustomerInSupabase(customerId).catch((err) =>
        console.error('Supabase customer delete error:', err)
      );
    }
  }, []);

  const value = {
    currentUser,
    customers,
    isAuthenticated: Boolean(currentUser),
    registerCustomer,
    loginCustomer,
    login,
    loginAsDemo,
    logout,
    addCustomerByAdmin,
    updateCustomerData,
    toggleCustomerStatus,
    resetCustomerPassword,
    deleteCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
