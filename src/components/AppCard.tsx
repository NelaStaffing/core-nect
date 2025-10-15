import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  iconColor?: string;
}

export default function AppCard({ title, description, icon: Icon, onClick, iconColor = "text-primary" }: AppCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:scale-105 bg-[var(--gradient-card)]"
      onClick={onClick}
    >
      <CardHeader className="space-y-4">
        <div className={`w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <CardTitle className="text-xl mb-2">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-primary/5 transition-colors"
        >
          Open App
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
