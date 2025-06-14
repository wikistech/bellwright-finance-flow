import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Admin login attempt for:', email);
      
      // First, authenticate the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (authError) {
        console.error('Authentication error:', authError);
        let errorMessage = "Invalid email or password.";
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else if (authError.message.includes('Email not confirmed')) {
          // This check may not be relevant if email confirmation is disabled
          errorMessage = "Please check your email for a confirmation link before logging in, or contact support if confirmation is not required.";
        }
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        // Should not happen if authError is null, but good to check
        throw new Error("Authentication failed, user data not found.");
      }

      console.log('Authentication successful for user ID:', authData.user.id);

      // Now, check if the authenticated user is a valid and approved admin
      const { data: adminData, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('id, email, status, first_name, last_name')
        .eq('id', authData.user.id) // Query by the authenticated user's ID
        .single();

      if (adminCheckError) {
        console.error('Admin check error after auth:', adminCheckError);
        // If PGRST116, it means no record in admin_users for this authenticated user
        if (adminCheckError.code === 'PGRST116') { 
          // Sign out the user as they authenticated but are not in admin_users
          await supabase.auth.signOut();
          throw new Error("Your account is not registered as an admin. Please register or contact support.");
        }
        throw new Error("Failed to verify admin account details. Please try again.");
      }

      console.log('Admin details found:', adminData);

      // Check if admin is approved
      if (adminData.status !== 'approved') {
        let statusMessage = '';
        switch (adminData.status) {
          case 'pending':
            statusMessage = "Your admin account is pending approval. Please wait for the SuperAdmin to approve your registration.";
            break;
          case 'rejected':
            statusMessage = "Your admin account has been rejected. Please contact the SuperAdmin for more information.";
            break;
          default:
            statusMessage = `Your admin account status is '${adminData.status}'. Please contact the SuperAdmin.`;
        }
        // Sign out the user as their admin account is not approved
        await supabase.auth.signOut();
        throw new Error(statusMessage);
      }
      
      // Admin is authenticated and approved
      console.log('Admin login successful, user is approved admin:', authData.user.id);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${adminData.first_name || 'Admin'}!`,
      });
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Admin login process error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-4 left-4 text-gray-600 hover:text-indigo-600 transition-colors">
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
          <h1 className="text-3xl font-bold text-indigo-600">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Access your admin dashboard</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Need an admin account?{" "}
              <Link to="/admin/register" className="text-indigo-600 hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance Admin Portal. All rights reserved.</p>
      </div>
    </div>
  );
}
