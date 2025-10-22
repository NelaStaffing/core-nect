import { Users, FileText, BarChart3, Building2, UserPlus, Target, Settings, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "users", label: "Users List", icon: Users },
  { id: "create-user", label: "Create User", icon: UserPlus },
  { id: "managers", label: "Manager List", icon: UserCog },
  { id: "companies", label: "Company List", icon: Building2 },
  { id: "surveys", label: "Surveys Setup", icon: FileText },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "kpi-cycles", label: "KPI and Cycles", icon: Target },
  { id: "system", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
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
