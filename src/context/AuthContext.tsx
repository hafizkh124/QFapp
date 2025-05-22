
'use client';

import type { AuthUser, ManagedEmployee } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';

// Sample users for mock authentication
// In a real app, this data (especially roles and employeeId) would come from Firestore/backend
const MOCK_USERS: Record<string, { passwordSaltedHash?: string; passwordPlain: string; user: AuthUser, managedEmployeeDetails?: ManagedEmployee }> = {
  'admin@quoriam.com': {
    passwordPlain: 'admin123',
    user: { uid: 'admin-uid', email: 'admin@quoriam.com', role: 'admin' },
    managedEmployeeDetails: { employeeId: 'QE101', employeeName: 'Umar Hayat', role: 'admin'}
  },
  'employee@quoriam.com': {
    passwordPlain: 'employee123',
    user: { uid: 'employee-uid', email: 'employee@quoriam.com', role: 'employee', employeeId: 'QE104', employeeName: 'Salman Karamat'},
    managedEmployeeDetails: { employeeId: 'QE104', employeeName: 'Salman Karamat', role: 'employee'}
  },
   'khubaib@quoriam.com': {
    passwordPlain: 'khubaib123',
    user: { uid: 'khubaib-uid', email: 'khubaib@quoriam.com', role: 'employee', employeeId: 'QE102', employeeName: 'Abdullah Khubaib'},
    managedEmployeeDetails: { employeeId: 'QE102', employeeName: 'Abdullah Khubaib', role: 'employee'}
  }
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // In a real app, you'd have a method to fetch full user profile with employee details
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth state from localStorage or a cookie
    try {
      const storedUser = localStorage.getItem('quoriam-auth-user');
      if (storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        // Basic validation of the stored user object
        if (parsedUser && parsedUser.uid && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('quoriam-auth-user'); // Clear invalid stored user
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
      router.push('/'); // Redirect logged-in users away from login page
    }
  }, [user, isLoading, pathname, router]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const mockUserData = MOCK_USERS[email.toLowerCase()];
    if (mockUserData && mockUserData.passwordPlain === pass) {
      setUser(mockUserData.user);
      localStorage.setItem('quoriam-auth-user', JSON.stringify(mockUserData.user));
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
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.'});
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
