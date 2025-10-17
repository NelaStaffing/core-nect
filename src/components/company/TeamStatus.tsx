import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MapPin, Wifi, WifiOff } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  timezone: string;
  status: "online" | "away" | "offline";
  lastActive: string;
  location: string;
}

export default function TeamStatus() {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Chen",
      role: "Remote Developer",
      timezone: "PST (UTC-8)",
      status: "online",
      lastActive: "Active now",
      location: "San Francisco, US"
    },
    {
      id: "2",
      name: "Ahmed Hassan",
      role: "Contractor Designer",
      timezone: "EET (UTC+2)",
      status: "online",
      lastActive: "Active now",
      location: "Cairo, Egypt"
    },
    {
      id: "3",
      name: "Maria Silva",
      role: "Remote Support",
      timezone: "BRT (UTC-3)",
      status: "away",
      lastActive: "15 min ago",
      location: "São Paulo, Brazil"
    },
    {
      id: "4",
      name: "John Park",
      role: "Temp QA Engineer",
      timezone: "JST (UTC+9)",
      status: "offline",
      lastActive: "6 hours ago",
      location: "Tokyo, Japan"
    },
    {
      id: "5",
      name: "Emma Wilson",
      role: "Remote Marketing",
      timezone: "GMT (UTC+0)",
      status: "online",
      lastActive: "Active now",
      location: "London, UK"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "offline" ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />;
  };

  const onlineCount = teamMembers.filter(m => m.status === "online").length;
  const awayCount = teamMembers.filter(m => m.status === "away").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Status</h1>
        <p className="text-muted-foreground mt-2">
          Real-time availability and location tracking for distributed teams
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{onlineCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Team members active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Away</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{awayCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Temporarily unavailable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Time Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Different regions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Availability</CardTitle>
          <CardDescription>Current status of all remote and staffing team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {member.timezone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusIcon(member.status)}
                  <span>{member.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
