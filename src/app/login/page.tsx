
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { AppLogo } from '@/components/layout/app-logo';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const REMEMBER_ME_EMAIL_KEY = 'quoriam-remember-me-email';
const REMEMBER_ME_PASSWORD_KEY = 'quoriam-remember-me-password';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
      const rememberedPassword = localStorage.getItem(REMEMBER_ME_PASSWORD_KEY);

      if (rememberedEmail && rememberedPassword) {
        setEmail(rememberedEmail);
        setPassword(rememberedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Error reading remembered credentials from localStorage:", error);
      // Clear potentially corrupted keys
      localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
      localStorage.removeItem(REMEMBER_ME_PASSWORD_KEY);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const success = await login(email, password);

      if (success) {
        if (rememberMe) {
          // Security Note: Storing plain text passwords in localStorage is insecure.
          // This is for prototype/demonstration purposes only.
          // In a real application, use secure token-based authentication.
          localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
          localStorage.setItem(REMEMBER_ME_PASSWORD_KEY, password);
        } else {
          localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
          localStorage.removeItem(REMEMBER_ME_PASSWORD_KEY);
        }
        toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
        router.push('/');
      } else {
        // Error toast is handled by the login function in AuthContext
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ variant: 'destructive', title: 'Login Failed', description: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <AppLogo className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Quoriam Insights</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete={rememberMe ? "current-password" : "new-password"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1} 
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              {/* Placeholder for forgot password link if needed in future
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
              */}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
