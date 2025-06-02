
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

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fixed superadmin credentials
  const SUPERADMIN_EMAIL = 'wikistech07@gmail.com';
  const SUPERADMIN_PASSWORD = 'Superadmin01';

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
      // Check if credentials match the fixed superadmin credentials
      if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
        throw new Error('Invalid superadmin credentials. Access denied.');
      }

      // Set superadmin session
      sessionStorage.setItem('superadmin_authenticated', 'true');
      sessionStorage.setItem('superadmin_email', email);

      toast({
        title: 'SuperAdmin Login Successful',
        description: 'Welcome to the superadmin dashboard.',
      });

      // Direct navigation to superadmin dashboard
      navigate('/superadmin/dashboard');
    } catch (error: any) {
      setErrorMessage(error.message || 'Invalid credentials. Access denied.');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Access denied.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-center items-center p-4">
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
          <p className="text-gray-600 mt-2">SuperAdmin Portal</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              SuperAdmin Access
            </CardTitle>
            <CardDescription className="text-center">
              Enter superadmin credentials to access the dashboard
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
                    placeholder="superadmin@example.com"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                disabled={isLoading}
              >
                {isLoading ? "Accessing..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-4">
            <div className="w-full border-t pt-4">
              <p className="text-sm text-gray-600 text-center">
                <Link to="/admin/login" className="text-finance-primary hover:underline flex items-center justify-center">
                  <ArrowRight className="mr-1 rotate-180 h-4 w-4" />
                  Admin login
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
