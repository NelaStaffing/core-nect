import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, ShoppingBag, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch available rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .eq("active", true)
      .order("points_cost", { ascending: true });

    if (rewardsError) {
      toast({ title: "Error loading rewards", variant: "destructive" });
    } else {
      setRewards(rewardsData || []);
    }

    // Fetch user redemptions
    const { data: redemptionsData, error: redemptionsError } = await supabase
      .from("reward_redemptions")
      .select("*, rewards(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (redemptionsError) {
      toast({ title: "Error loading redemptions", variant: "destructive" });
    } else {
      setRedemptions(redemptionsData || []);
    }

    // Calculate total points from achievements
    const { data: progressData } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id)
      .eq("unlocked", true);

    const points = (progressData || []).reduce((sum: number, p: any) => {
      return sum + (p.achievements?.points || 0);
    }, 0);

    // Subtract redeemed points
    const spentPoints = (redemptionsData || [])
      .filter((r: any) => r.status !== "cancelled")
      .reduce((sum: number, r: any) => sum + r.points_spent, 0);

    setTotalPoints(points - spentPoints);
  };

  const handleRedeem = async () => {
    if (!selectedReward) return;
    if (totalPoints < selectedReward.points_cost) {
      toast({ title: "Not enough points!", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("reward_redemptions").insert({
      user_id: user.id,
      reward_id: selectedReward.id,
      points_spent: selectedReward.points_cost,
    });

    if (error) {
      toast({ title: "Error redeeming reward", variant: "destructive" });
    } else {
      toast({ title: "Reward redeemed successfully!", description: "It will be processed by your company" });
      setSelectedReward(null);
      fetchData();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      approved: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      delivered: "bg-green-500/20 text-green-700 dark:text-green-300",
      cancelled: "bg-red-500/20 text-red-700 dark:text-red-300",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rewards Store</h2>
          <p className="text-muted-foreground">Redeem your points for rewards</p>
        </div>
        <Card className="border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Rewards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Available Rewards</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = totalPoints >= reward.points_cost;
            return (
              <Card
                key={reward.id}
                className={`hover:shadow-lg transition-all ${!canAfford ? "opacity-50" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    {reward.stock_quantity !== null && (
                      <Badge variant="outline">{reward.stock_quantity} left</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  {reward.description && (
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {reward.points_cost} points
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          disabled={!canAfford || (reward.stock_quantity !== null && reward.stock_quantity === 0)}
                          onClick={() => setSelectedReward(reward)}
                        >
                          Redeem
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Redemption</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>
                            Are you sure you want to redeem <strong>{selectedReward?.title}</strong> for{" "}
                            <strong>{selectedReward?.points_cost} points</strong>?
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You will have {totalPoints - (selectedReward?.points_cost || 0)} points remaining.
                          </p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedReward(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleRedeem} disabled={loading}>
                            {loading ? "Processing..." : "Confirm"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {rewards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No rewards available yet. Check back soon!
          </CardContent>
        </Card>
      )}

      {/* My Redemptions */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          My Redemptions
        </h3>
        {redemptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No redemptions yet. Start redeeming rewards!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {redemptions.map((redemption) => (
              <Card key={redemption.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">{redemption.rewards.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(redemption.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{redemption.points_spent} points</Badge>
                      {getStatusBadge(redemption.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
