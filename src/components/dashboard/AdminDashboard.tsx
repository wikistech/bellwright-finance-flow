
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
}

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Get the list of all users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;
        
        // Format the user data
        const userProfiles: UserProfile[] = (authUsers?.users || []).map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name
        }));
        
        setProfiles(userProfiles);
      } catch (error: any) {
        console.error("Error loading users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profiles. You may not have admin permissions.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    {`${profile.first_name || ""} ${profile.last_name || ""}`}
                  </TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
