import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin' : (user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login API response data:', data);
      
      if (!data || !data.user) {
        console.error('Login success status but missing user in data:', data);
        throw new Error('User data missing from response');
      }

      login(data.user);
      toast.success('Logged in successfully!');
      
      const redirectPath = data.user.role === 'admin' ? '/admin' : (data.user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
      navigate(redirectPath);
    } catch (error: any) {
      console.error('Login failed', error);
      
      // Only fallback to demo if the server is genuinely unreachable
      const isUnreachable = error.code === 'ERR_NETWORK' || error.response?.status === 503;

      if (isUnreachable) {
        const demoUser = {
          id: 'demo-123',
          email,
          displayName: email.split('@')[0],
          role: email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('provider') ? 'provider' : 'user')
        };
        login(demoUser as any);
        toast.info('Using demo account (Server Unreachable)');
        const redirectPath = demoUser.role === 'admin' ? '/admin' : (demoUser.role === 'provider' ? '/provider/dashboard' : '/dashboard');
        navigate(redirectPath);
        return;
      }

      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
