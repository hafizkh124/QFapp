
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext'; // We will create this
import { AppLogo } from '@/components/layout/app-logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app, login would be an async call to Firebase/backend
      // For now, we simulate it with a delay and check hardcoded credentials
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = await login(email, password);

      if (success) {
        toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
        router.push('/'); // Redirect to dashboard or role-specific page
      } else {
        // Error is handled by login function setting toast
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
          <CardTitle className="text-2xl">Welcome to Quoriam Foods</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="text-center text-sm">
              {/* Placeholder for forgot password */}
              {/* <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
