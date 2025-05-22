
'use client';

import type { AuthUser, ManagedEmployee } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';

// Minimal hardcoded user for initial admin login IF localStorage is empty
const FALLBACK_ADMIN_USER: ManagedEmployee = {
  employeeId: 'QE000', // Special ID for fallback
  employeeName: 'Fallback Admin',
  role: 'admin',
  email: 'admin@quoriam.com',
  password: 'admin123' // This is still plain text, for mock only
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MANAGED_EMPLOYEES_KEY_AUTH = 'quoriam-managed-employees-v2'; // Must match performance page key

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('quoriam-auth-user');
      if (storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.uid && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('quoriam-auth-user');
        }
      }
    } catch (error) {
      console.error("Error reading auth user from localStorage:", error);
      localStorage.removeItem('quoriam-auth-user');
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
    let foundInLocalStorage = false;

    try {
      const storedEmployeesString = localStorage.getItem(MANAGED_EMPLOYEES_KEY_AUTH);
      if (storedEmployeesString) {
        const storedEmployees: ManagedEmployee[] = JSON.parse(storedEmployeesString);
        if (Array.isArray(storedEmployees)) {
          const foundEmp = storedEmployees.find(emp => emp.email.toLowerCase() === email.toLowerCase() && emp.password === pass);
          if (foundEmp) {
            authenticatedEmployee = foundEmp;
            foundInLocalStorage = true;
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
        uid: authenticatedEmployee.employeeId, // Use employeeId as uid for simplicity
        email: authenticatedEmployee.email,
        role: authenticatedEmployee.role,
        employeeId: authenticatedEmployee.employeeId,
        employeeName: authenticatedEmployee.employeeName,
      };
      setUser(authUserPayload);
      localStorage.setItem('quoriam-auth-user', JSON.stringify(authUserPayload));
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
    localStorage.removeItem('quoriam-auth-user');
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
