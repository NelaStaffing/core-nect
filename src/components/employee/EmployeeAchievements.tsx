import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Target, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeAchievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all achievements
    const { data: achievementsData, error: achError } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: false });

    if (achError) {
      toast({ title: "Error loading achievements", variant: "destructive" });
      return;
    }

    // Fetch user progress
    const { data: progressData, error: progError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    if (progError) {
      toast({ title: "Error loading progress", variant: "destructive" });
      return;
    }

    setAchievements(achievementsData || []);
    setUserProgress(progressData || []);

    // Calculate total points from unlocked achievements
    const points = (progressData || [])
      .filter((p: any) => p.unlocked)
      .reduce((sum: number, p: any) => {
        const ach = (achievementsData || []).find((a: any) => a.id === p.achievement_id);
        return sum + (ach?.points || 0);
      }, 0);
    setTotalPoints(points);
  };

  const getProgressForAchievement = (achievementId: string) => {
    return userProgress.find((p) => p.achievement_id === achievementId);
  };

  const getIconForCategory = (category: string) => {
    const icons: Record<string, any> = {
      learning: Star,
      performance: Trophy,
      collaboration: Award,
      innovation: Zap,
      leadership: Crown,
      milestone: Target,
    };
    return icons[category] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      learning: "bg-blue-500",
      performance: "bg-yellow-500",
      collaboration: "bg-green-500",
      innovation: "bg-purple-500",
      leadership: "bg-red-500",
      milestone: "bg-indigo-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getLevel = () => {
    if (totalPoints < 100) return { level: 1, name: "Seedling" };
    if (totalPoints < 300) return { level: 2, name: "Sprout" };
    if (totalPoints < 600) return { level: 3, name: "Sapling" };
    if (totalPoints < 1000) return { level: 4, name: "Young Tree" };
    if (totalPoints < 1500) return { level: 5, name: "Mature Tree" };
    return { level: 6, name: "Ancient Oak" };
  };

  const levelInfo = getLevel();
  const nextLevelPoints = [100, 300, 600, 1000, 1500, 2000][levelInfo.level - 1] || 2000;
  const levelProgress = (totalPoints / nextLevelPoints) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Achievement Tree</h2>
        <p className="text-muted-foreground">Grow your tree by unlocking achievements</p>
      </div>

      {/* Tree Growth Visual */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">🌳</div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">{levelInfo.name}</h3>
              <p className="text-lg text-muted-foreground">Level {levelInfo.level}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {totalPoints} / {nextLevelPoints} points to next level
              </p>
            </div>
            <Progress value={levelProgress} className="w-full max-w-md h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Total Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Total Points: {totalPoints}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const progress = getProgressForAchievement(achievement.id);
          const isUnlocked = progress?.unlocked || false;
          const currentProgress = progress?.progress || 0;
          const progressPercent = (currentProgress / achievement.required_count) * 100;
          const Icon = getIconForCategory(achievement.category);
          const categoryColor = getCategoryColor(achievement.category);

          return (
            <Card
              key={achievement.id}
              className={`transition-all hover:shadow-lg ${
                isUnlocked ? "border-yellow-500 border-2" : "opacity-60"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${categoryColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isUnlocked && <Badge className="bg-yellow-500">Unlocked!</Badge>}
                </div>
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {currentProgress} / {achievement.required_count}
                    </span>
                  </div>
                  <Progress value={progressPercent} />
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                      +{achievement.points} points
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">{achievement.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No achievements available yet. Check back soon!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
