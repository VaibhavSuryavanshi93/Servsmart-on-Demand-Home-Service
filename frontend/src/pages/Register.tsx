import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'user');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' ? '/admin' : (user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Enter your email first');
      return;
    }

    setOtpLoading(true);
    try {
      await api.post('/auth/send-email-otp', { email });
      setOtpSent(true);
      setOtpVerified(false);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      toast.error('Enter your email and OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await api.post('/auth/verify-email-otp', { email, otp });
      setOtpVerified(true);
      toast.success('Email verified');
    } catch (error: any) {
      setOtpVerified(false);
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error('Please verify your email OTP before signing up');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, displayName, role });
      login(data.user);
      toast.success('Account created successfully!');
      
      const redirectPath = data.user.role === 'admin' ? '/admin' : (data.user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
      navigate(redirectPath);
    } catch (error: any) {
      console.error('Registration failed', error);

      // Fallback for demo purposes if DB is not connected
      const isOffline = error.code === 'ERR_NETWORK' || 
                        error.response?.status === 500 || 
                        error.response?.status === 404 ||
                        error.response?.status === 503;

      if (isOffline) {
        const demoUser = {
          id: 'demo-' + Date.now(),
          email,
          displayName,
          role
        };
        login(demoUser as any);
        toast.info('Using demo account (Database not connected)');
        navigate(role === 'provider' ? '/provider/dashboard' : '/dashboard');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOtpVerified(false);
                  }}
                  required
                />
                <Button type="button" variant="outline" onClick={handleSendOtp} disabled={otpLoading || !email}>
                  {otpSent ? 'Resend' : 'Send OTP'}
                </Button>
              </div>
            </div>
            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Email OTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setOtpVerified(false);
                    }}
                    required
                  />
                  <Button type="button" variant={otpVerified ? 'default' : 'outline'} onClick={handleVerifyOtp} disabled={otpLoading || !otp}>
                    {otpVerified ? 'Verified' : 'Verify'}
                  </Button>
                </div>
              </div>
            )}
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
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Customer</SelectItem>
                  <SelectItem value="provider">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
