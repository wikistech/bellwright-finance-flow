
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Clear error message when inputs change
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    if (errorMessage) setErrorMessage('');
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // First check if the admin exists and their status
      const { data: adminData, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('id, status, first_name, last_name')
        .eq('email', email.toLowerCase())
        .single();

      if (adminCheckError || !adminData) {
        throw new Error('Invalid admin credentials. Please check your email and try again.');
      }

      // Check admin status before attempting login
      if (adminData.status === 'pending') {
        throw new Error('Your admin account is pending approval by a superadmin. Please wait for approval before logging in.');
      }

      if (adminData.status === 'rejected') {
        throw new Error('Your admin account has been rejected. Please contact support for assistance.');
      }

      if (adminData.status !== 'approved') {
        throw new Error('Your admin account status is invalid. Please contact support.');
      }

      // If admin is approved, proceed with authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Login failed - no user data received');
      }

      // Verify the logged-in user matches the admin record
      if (authData.user.id !== adminData.id) {
        await supabase.auth.signOut();
        throw new Error('Authentication error. Please try again.');
      }

      // Success - redirect to admin dashboard
      toast({
        title: 'Admin Login Successful',
        description: `Welcome ${adminData.first_name} ${adminData.last_name}! Redirecting to admin dashboard...`,
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login.');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An error occurred during login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-4 left-4 text-gray-600 hover:text-finance-primary transition-colors">
        <span className="flex items-center">
          <ArrowRight className="mr-1 rotate-180" />
          Back to Home
        </span>
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Bellwright Finance</h1>
          <p className="text-gray-600 mt-2">Admin Portal</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 relative">
                {errorMessage}
                <button 
                  className="absolute top-0 right-0 p-2" 
                  onClick={() => setErrorMessage('')}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => handleInputChange(setEmail, e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-finance-primary hover:bg-finance-secondary" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Need an admin account?{" "}
              <Link to="/admin/register" className="text-finance-primary hover:underline">
                Register as admin
              </Link>
            </p>
            <div className="text-xs text-gray-500 text-center border-t pt-4 mt-2">
              <p>Note: Admin accounts require approval by a superadmin before access is granted.</p>
            </div>
            <div className="w-full border-t pt-4">
              <p className="text-sm text-gray-600 text-center flex items-center justify-center space-x-4">
                <Link to="/login" className="text-finance-primary hover:underline flex items-center">
                  <ArrowRight className="mr-1 rotate-180 h-4 w-4" />
                  Regular login
                </Link>
                <Link to="/superadmin/login" className="text-indigo-600 hover:underline flex items-center">
                  <Shield className="mr-1 h-4 w-4" />
                  SuperAdmin
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
