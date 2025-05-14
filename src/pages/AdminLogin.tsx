
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
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
      // Check if email is the admin email - using the specified email
      if (email !== 'wikistech07@gmail.com') {
        throw new Error('Only authorized admin accounts can log in here.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminData) {
        // If admin check fails, add this user as admin since we know it's the correct email
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert([{ email: email }]);

        if (insertError) {
          // If insert fails, sign out and show error
          await supabase.auth.signOut();
          throw new Error('Failed to set up admin privileges. Please contact support.');
        }
      }

      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin dashboard.',
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
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
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
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
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Not an admin?{" "}
              <Link to="/login" className="text-finance-primary hover:underline">
                Regular login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
