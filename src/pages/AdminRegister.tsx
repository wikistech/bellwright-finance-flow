
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Shield } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AdminRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Starting admin registration for:', values.email);
      
      // Check if admin already exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', values.email.toLowerCase())
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing admin:', checkError);
      }
      
      if (existingAdmin) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An admin account with this email already exists.",
        });
        setIsLoading(false);
        return;
      }
      
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            role: 'admin'
          }
        }
      });
      
      console.log('Auth signup result:', { authData, authError });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log('User created with ID:', authData.user.id);
      
      // Insert admin record with pending status using public access
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: values.email.toLowerCase(),
          first_name: values.firstName,
          last_name: values.lastName,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      console.log('Admin record insert result:', { adminData, adminError });
      
      if (adminError) {
        console.error('Admin record error:', adminError);
        // Even if admin record fails, we should still sign out the user
        await supabase.auth.signOut();
        throw new Error("Failed to create admin record: " + adminError.message);
      }

      console.log('Admin record created successfully:', adminData);

      // Sign out the user immediately after registration since they need approval first
      await supabase.auth.signOut();
      
      console.log('Admin registration completed successfully');
      
      toast({
        title: "Registration Successful",
        description: "Your admin account has been created and is pending approval by a superadmin. You will be able to login once approved.",
      });
      
      // Redirect to admin login page
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
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
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-finance-primary">Bellwright Finance</h1>
          <p className="text-gray-600 mt-2">Admin Registration Portal</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Registration
            </CardTitle>
            <CardDescription className="text-center">
              Create a new administrator account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input placeholder="admin@example.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-finance-primary hover:bg-finance-secondary" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Admin Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Already have an admin account?{" "}
              <Link to="/admin/login" className="text-finance-primary hover:underline">
                Admin Login
              </Link>
            </p>
            <div className="text-xs text-gray-500 text-center border-t pt-4 mt-2">
              <p>Note: Admin accounts require approval by a superadmin before access is granted.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>© 2025 Bellwright Finance. All rights reserved.</p>
      </div>
    </div>
  );
}
