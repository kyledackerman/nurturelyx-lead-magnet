import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { signUpSchema, signInSchema, sanitizeInput } from '@/lib/validation';
import { z } from 'zod';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, user, resetSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = password; // Don't sanitize password, just validate

      // Validate inputs using Zod
      if (isLogin) {
        signInSchema.parse({ email: sanitizedEmail, password: sanitizedPassword });
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        signUpSchema.parse({ email: sanitizedEmail, password: sanitizedPassword });
      }

      // Proceed with authentication - add timeout guard to avoid UI freeze
      const authPromise = isLogin
        ? signIn(sanitizedEmail, sanitizedPassword)
        : signUp(sanitizedEmail, sanitizedPassword);

      const timeout = new Promise<{ error: any }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('Request timed out') }), 8000)
      );

      const { error } = await Promise.race([authPromise, timeout]);

      if (error) {
        const msg = (typeof error?.message === 'string' && error.message) ? error.message : String(error || '');
        if (msg.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (msg.includes('User already registered')) {
          setError('An account with this email already exists');
        } else if (msg.includes('Email not confirmed')) {
          setError('Please check your email to confirm your account');
        } else if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('fetch')) {
          setError('Cannot reach the authentication server. Please try again or click “Reset auth and retry” below.');
        } else {
          // Surface actual error to aid debugging instead of a generic message
          setError(msg);
        }
        return;
      }

      if (isLogin) {
        toast.success('Welcome back!');
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        navigate(redirectTo);
      } else {
        toast.success('Account created! Please check your email to confirm your account.');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Display first validation error
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to view your report history'
                : 'Sign up to save and track your reports'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              <button
                type="button"
                className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
                onClick={async () => {
                  try {
                    setError('');
                    setLoading(true);
                    await resetSession();
                    toast.success('Authentication reset. Please try again.');
                  } catch (e) {
                    setError('Could not reset authentication. Please refresh and try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Reset auth and retry
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuthPage;