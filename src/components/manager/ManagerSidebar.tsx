import { Users, FileText, BarChart3, Heart, ClipboardCheck, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "employees", label: "My Team", icon: Users },
  { id: "kpi-surveys", label: "Employee KPI", icon: Target },
  { id: "requests", label: "Requests", icon: ClipboardCheck },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "engagement", label: "Engagement", icon: Heart },
  { id: "surveys", label: "Surveys", icon: FileText },
];

export default function ManagerSidebar({ activeSection, onSectionChange }: ManagerSidebarProps) {
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
