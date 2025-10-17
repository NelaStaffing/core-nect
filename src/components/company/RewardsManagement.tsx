import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Gift, Plus, Edit, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RewardsManagement() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points_cost: 0,
    category: "",
    stock_quantity: null as number | null,
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .eq("company_id", user.id)
      .order("created_at", { ascending: false });

    if (rewardsError) {
      toast({ title: "Error fetching rewards", variant: "destructive" });
    } else {
      setRewards(rewardsData || []);
    }

    // Fetch redemptions
    const { data: redemptionsData, error: redemptionsError } = await supabase
      .from("reward_redemptions")
      .select("*, rewards(*), profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false });

    if (redemptionsError) {
      toast({ title: "Error fetching redemptions", variant: "destructive" });
    } else {
      setRedemptions(redemptionsData || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingReward) {
      const { error } = await supabase
        .from("rewards")
        .update(formData)
        .eq("id", editingReward.id);

      if (error) {
        toast({ title: "Error updating reward", variant: "destructive" });
      } else {
        toast({ title: "Reward updated successfully!" });
      }
    } else {
      const { error } = await supabase.from("rewards").insert({
        ...formData,
        company_id: user.id,
      });

      if (error) {
        toast({ title: "Error creating reward", variant: "destructive" });
      } else {
        toast({ title: "Reward created successfully!" });
      }
    }

    setIsOpen(false);
    setEditingReward(null);
    setFormData({
      title: "",
      description: "",
      points_cost: 0,
      category: "",
      stock_quantity: null,
      active: true,
    });
    fetchData();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;

    const { error } = await supabase.from("rewards").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting reward", variant: "destructive" });
    } else {
      toast({ title: "Reward deleted successfully!" });
      fetchData();
    }
  };

  const handleUpdateRedemptionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reward_redemptions")
      .update({ 
        status,
        delivered_at: status === "delivered" ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating redemption", variant: "destructive" });
    } else {
      toast({ title: "Redemption updated!" });
      fetchData();
    }
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

  const openEditDialog = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description || "",
      points_cost: reward.points_cost,
      category: reward.category || "",
      stock_quantity: reward.stock_quantity,
      active: reward.active,
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rewards Management</h2>
          <p className="text-muted-foreground">Manage rewards and track redemptions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingReward(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingReward ? "Edit Reward" : "Create New Reward"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., $50 Amazon Gift Card"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about the reward..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Points Cost</Label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={formData.points_cost}
                    onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Stock Quantity (optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_quantity || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: e.target.value ? parseInt(e.target.value) : null })
                    }
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <Label>Category (optional)</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Gift Cards, Merchandise"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label>Active (visible to employees)</Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : editingReward ? "Update Reward" : "Create Reward"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards">Rewards ({rewards.length})</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions ({redemptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={!reward.active ? "opacity-50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(reward)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(reward.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  {reward.description && <p className="text-sm text-muted-foreground">{reward.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-500">{reward.points_cost} points</Badge>
                      {reward.stock_quantity !== null && (
                        <Badge variant="outline">
                          <Package className="w-3 h-3 mr-1" />
                          {reward.stock_quantity} left
                        </Badge>
                      )}
                    </div>
                    {!reward.active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="redemptions" className="mt-6">
          <div className="space-y-4">
            {redemptions.map((redemption) => (
              <Card key={redemption.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{redemption.rewards.title}</p>
                        {getStatusBadge(redemption.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Employee: {redemption.profiles?.first_name} {redemption.profiles?.last_name}
                        </p>
                        <p>Points: {redemption.points_spent}</p>
                        <p>Date: {new Date(redemption.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {redemption.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateRedemptionStatus(redemption.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateRedemptionStatus(redemption.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {redemption.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRedemptionStatus(redemption.id, "delivered")}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
