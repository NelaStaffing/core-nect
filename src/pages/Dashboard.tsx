import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import { UserCheck, Building2, Users, Loader2 } from "lucide-react";
import { getUserProfile, getUserRoles, UserProfile, UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface MicroApp {
  id: string;
  title: string;
  description: string;
  icon: any;
  url: string;
  roles: UserRole[];
}

const microApps: MicroApp[] = [
  {
    id: "onboarding",
    title: "Onboarding",
    description: "Complete your onboarding journey and get familiar with the team.",
    icon: UserCheck,
    url: "https://your-onboarding-app-url.com",
    roles: ["employee", "admin"],
  },
  {
    id: "employee",
    title: "Employee Portal",
    description: "Access employee resources, time tracking, and personal information.",
    icon: Users,
    url: "https://your-employee-app-url.com",
    roles: ["employee", "admin"],
  },
  {
    id: "company",
    title: "Company Management",
    description: "Manage company settings, teams, and organizational structure.",
    icon: Building2,
    url: "https://your-company-app-url.com",
    roles: ["company", "admin"],
  },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const userProfile = await getUserProfile(session.user.id);
      const userRoles = await getUserRoles(session.user.id);
      
      setProfile(userProfile);
      setRoles(userRoles);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAppClick = (app: MicroApp) => {
    toast({
      title: `Opening ${app.title}`,
      description: "In a real deployment, this would navigate to the micro app.",
    });
    // In production, you would navigate to the actual micro app URL
    // window.location.href = app.url;
  };

  const getAvailableApps = () => {
    return microApps.filter(app => 
      app.roles.some(role => roles.includes(role))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableApps = getAvailableApps();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.first_name}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Access your workspace applications below
            </p>
          </div>

          {availableApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No applications available for your role.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableApps.map((app) => (
                <AppCard
                  key={app.id}
                  title={app.title}
                  description={app.description}
                  icon={app.icon}
                  onClick={() => handleAppClick(app)}
                />
              ))}
            </div>
          )}

          <div className="mt-16 p-6 rounded-lg bg-secondary/50 border">
            <h2 className="text-xl font-semibold mb-2">Quick Info</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You have access to {availableApps.length} application{availableApps.length !== 1 ? 's' : ''} based on your role.
            </p>
            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <span key={role} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
