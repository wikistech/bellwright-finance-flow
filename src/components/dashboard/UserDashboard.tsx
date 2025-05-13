
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Profile, getProfile } from "@/utils/profiles";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First check if profiles table exists, if not create a basic profile from auth data
        try {
          const profileData = await getProfile(user.id);
          setProfile(profileData);
        } catch (error: any) {
          console.error("Error loading profile:", error);
          
          // If the error indicates the profile table doesn't exist, create a basic profile
          if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
            // Create a basic profile from auth user data
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const firstName = userData.user.user_metadata?.firstName || '';
              const lastName = userData.user.user_metadata?.lastName || '';
              const email = userData.user.email || '';
              
              // Create a local profile without saving to DB (since table doesn't exist)
              const basicProfile: Profile = {
                id: userData.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                created_at: userData.user.created_at
                // updated_at is optional now
              };
              
              setProfile(basicProfile);
            }
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load user profile data.",
            });
          }
        }
      } catch (error) {
        console.error("Error in profile loading:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-finance-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Welcome, {profile?.first_name || "User"}!</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Name: </span>
              <span>{`${profile?.first_name || ""} ${profile?.last_name || ""}`}</span>
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              <span>{profile?.email || user?.email}</span>
            </div>
            <div>
              <span className="font-semibold">Member since: </span>
              <span>
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString() 
                  : user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserDashboard;
