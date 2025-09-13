'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '../types';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock users for development
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@college.edu',
      role: USER_ROLES.ADMIN,
      department: 'Administration'
    },
    {
      id: '2',
      name: 'Staff User',
      email: 'staff@college.edu',
      role: USER_ROLES.STAFF,
      department: 'Admissions'
    },
    {
      id: '3',
      name: 'Hostel Warden',
      email: 'warden@college.edu',
      role: USER_ROLES.HOSTEL_WARDEN,
      department: 'Hostel'
    },
    {
      id: '4',
      name: 'John Doe',
      email: 'student@college.edu',
      role: USER_ROLES.STUDENT,
      department: 'Computer Science',
      registrationNumber: 'CS2024001'
    }
  ];

  useEffect(() => {
    // Check for stored auth on mount - try cookies first, then localStorage
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const cookieUser = getCookie('erp-user');
    if (cookieUser) {
      try {
        const user = JSON.parse(decodeURIComponent(cookieUser));
        setUser(user);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    } else {
      // Fallback to localStorage
      const storedUser = localStorage.getItem('erp-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
          // Also set cookie for consistency
          document.cookie = `erp-user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400`; // 24 hours
        } catch (error) {
          console.error('Error parsing user localStorage:', error);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser && password === 'password') { // Simple mock password
      setUser(foundUser);
      localStorage.setItem('erp-user', JSON.stringify(foundUser));
      // Also set cookie for middleware
      document.cookie = `erp-user=${encodeURIComponent(JSON.stringify(foundUser))}; path=/; max-age=86400`; // 24 hours
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp-user');
    // Clear cookie as well
    document.cookie = 'erp-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const canAccessModule = (module) => {
    if (!user) return false;

    const modulePermissions = {
      admissions: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
      fees: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT],
      hostel: [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT],
      exams: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT],
      dashboard: [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN]
    };

    return modulePermissions[module]?.includes(user.role) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    canAccessModule
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
