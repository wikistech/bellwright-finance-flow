
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const HARDCODED_EMAIL = "bellwrightfinance@gmail.com";
  const HARDCODED_PASSWORD = "Fine4real";

  useEffect(() => {
    // Check if already authenticated when component mounts
    const checkAuth = () => {
      const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
      console.log('Checking auth on AdminLogin mount:', isAuthenticated);
      
      if (isAuthenticated) {
        console.log('Already authenticated, redirecting to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Not authenticated, staying on login page');
        setIsCheckingAuth(false);
      }
    };

    // Small delay to prevent race conditions
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Attempting login with:', email);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      email.trim().toLowerCase() === HARDCODED_EMAIL &&
      password === HARDCODED_PASSWORD
    ) {
      console.log('Login successful, setting authentication');
      sessionStorage.setItem('admin_authenticated', 'true');
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      
      // Navigate with replace to prevent back navigation issues
      navigate('/admin/dashboard', { replace: true });
    } else {
      console.log('Login failed - invalid credentials');
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials for admin login.",
      });
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex justify-center items-center">
        <div className="text-indigo-600">Checking authentication...</div>
      </div>
    );
  }

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
        </Card>
      </motion.div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance Admin Portal. All rights reserved.</p>
      </div>
    </div>
  );
}
