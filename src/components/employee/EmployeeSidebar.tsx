import { Home, Trophy, BookOpen, Calendar, Settings, LogOut, ClipboardList, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface EmployeeSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "surveys", label: "Surveys", icon: ClipboardList },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function EmployeeSidebar({ activePage, onPageChange }: EmployeeSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  return (
    <aside className="w-64 bg-secondary/30 border-r border-border p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary">Employee Portal</h2>
        <p className="text-sm text-muted-foreground">Navigate your workspace</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-all mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </aside>
  );
}
