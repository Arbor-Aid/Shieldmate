import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserOrganizations } from '@/services/orgAccessService';
import { listInvitesForEmail } from '@/services/inviteService';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signInWithGoogle, signInWithEmail, emailAuthEnabled, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveRedirectPath = async () => {
    if (!currentUser) return '/profile';
    const memberships = await getUserOrganizations(currentUser.uid);
    if (memberships.length === 0) {
      const invites = currentUser.email ? await listInvitesForEmail(currentUser.email) : [];
      if (invites.length > 0) return '/onboarding';
      return '/profile';
    }
    const hasOrgRole = memberships.some((m) => (m.roles || []).includes('org_admin') || (m.roles || []).includes('staff'));
    if (hasOrgRole) return '/org';
    return '/client';
  };

  useEffect(() => {
    const from = location.state?.from?.pathname || '/profile';
    if (currentUser) {
      navigate(from);
      return;
    }
    if (emailAuthEnabled && localStorage.getItem('authLoggedIn') === 'true') {
      navigate(from);
    }
  }, [navigate, location, emailAuthEnabled, currentUser]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      localStorage.setItem('authLoggedIn', 'true');

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      const from = location.state?.from?.pathname || (await resolveRedirectPath());
      navigate(from);
    } catch (err: any) {
      console.error("Email sign-in failed:", err);
      setError(err.message);
      toast({
        title: "Sign-in Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      const from = location.state?.from?.pathname || (await resolveRedirectPath());
      navigate(from);
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access veteran support services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!emailAuthEnabled}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleEmailLogin}
              disabled={loading || !emailAuthEnabled}
            >
              {emailAuthEnabled ? (loading ? 'Signing in...' : 'Sign in with Email') : 'Email sign-in disabled'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </div>

            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {!emailAuthEnabled && (
              <div className="p-3 text-sm bg-amber-50 text-amber-700 rounded-md">
                Email/password authentication is disabled for this environment. Use Google sign-in.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 w-full">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your information is secure and will only be used to provide veteran support services.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
