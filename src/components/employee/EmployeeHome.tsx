import GamificationCard from "./GamificationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Star, AlertCircle, Clock } from "lucide-react";

interface EmployeeHomeProps {
  onNavigate?: (page: string) => void;
}

export default function EmployeeHome({ onNavigate }: EmployeeHomeProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome Back! 👋</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Here's your progress and achievements
        </p>
      </div>

      {/* Pending Surveys */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Pending Survey
              </CardTitle>
              <CardDescription className="mt-2">
                Your weekly pulse check-in is ready
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
              60 seconds
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>5 questions</span>
              </div>
              <span>Due: Today</span>
            </div>
            <Button onClick={() => onNavigate?.("survey-take")}>
              Fill Out Survey
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GamificationCard
          title="Total Points"
          value="2,450"
          icon={Star}
          color="text-yellow-500"
          bgColor="bg-yellow-500/10"
        />
        <GamificationCard
          title="Level"
          value="12"
          icon={TrendingUp}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <GamificationCard
          title="Achievements"
          value="24"
          icon={Trophy}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
        <GamificationCard
          title="Goals Completed"
          value="18/25"
          icon={Target}
          color="text-green-500"
          bgColor="bg-green-500/10"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your activity this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm text-muted-foreground">12/15</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Learning Hours</span>
                <span className="text-sm text-muted-foreground">8/10</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Team Collaboration</span>
                <span className="text-sm text-muted-foreground">16/20</span>
              </div>
              <Progress value={80} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "First Week Complete", icon: "🎯", date: "2 days ago" },
                { title: "Team Player", icon: "🤝", date: "5 days ago" },
                { title: "Quick Learner", icon: "⚡", date: "1 week ago" },
              ].map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {["Start Learning", "View Schedule", "Team Chat", "Submit Report"].map((action) => (
              <button
                key={action}
                className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
              >
                <p className="font-medium text-sm md:text-base">{action}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
