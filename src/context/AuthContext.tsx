
'use client';

import type { AuthUser, ManagedEmployee } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';

// Fallback admin user for initial login IF localStorage is empty
const FALLBACK_ADMIN_USER: ManagedEmployee = {
  employeeId: 'QE101', // Corresponds to Umar Hayat in initial data
  employeeName: 'Umar Hayat', // Default admin name
  role: 'admin',
  email: 'hafizkh124@gmail.com', // Updated email
  password: '1quoriam1' // Updated password
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MANAGED_EMPLOYEES_KEY_AUTH = 'quoriam-managed-employees-v2';
const AUTH_USER_KEY = 'quoriam-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.uid && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
    } catch (error) {
      console.error("Error reading auth user from localStorage:", error);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    } else if (!isLoading && user && pathname === '/login') {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    let authenticatedEmployee: ManagedEmployee | null = null;

    try {
      const storedEmployeesString = localStorage.getItem(MANAGED_EMPLOYEES_KEY_AUTH);
      if (storedEmployeesString) {
        const storedEmployees: ManagedEmployee[] = JSON.parse(storedEmployeesString);
        if (Array.isArray(storedEmployees)) {
          const foundEmp = storedEmployees.find(emp => emp.email.toLowerCase() === email.toLowerCase() && emp.password === pass);
          if (foundEmp) {
            authenticatedEmployee = foundEmp;
          }
        }
      }
    } catch (error) {
      console.error("Error reading managed employees from localStorage during login:", error);
      // Proceed to fallback check
    }

    // If not found in localStorage, check fallback admin
    if (!authenticatedEmployee && FALLBACK_ADMIN_USER.email.toLowerCase() === email.toLowerCase() && FALLBACK_ADMIN_USER.password === pass) {
        authenticatedEmployee = FALLBACK_ADMIN_USER;
    }

    if (authenticatedEmployee) {
      const authUserPayload: AuthUser = {
        uid: authenticatedEmployee.employeeId,
        email: authenticatedEmployee.email,
        role: authenticatedEmployee.role,
        employeeId: authenticatedEmployee.employeeId,
        employeeName: authenticatedEmployee.employeeName,
      };
      setUser(authUserPayload);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUserPayload));
      setIsLoading(false);
      return true;
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    router.push('/login');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
