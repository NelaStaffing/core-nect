import { Users, FileText, BarChart3, LayoutDashboard, Activity, UserCog, Heart, ClipboardCheck, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanySidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "team-status", label: "Team Status", icon: Activity },
  { id: "staffing", label: "Staffing", icon: UserCog },
  { id: "engagement", label: "Engagement", icon: Heart },
  { id: "requests", label: "Requests", icon: ClipboardCheck },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "surveys", label: "Surveys", icon: FileText },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
];

export default function CompanySidebar({ activeSection, onSectionChange }: CompanySidebarProps) {
  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-73px)] p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}