import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, MessageSquare, Palmtree, UserPlus, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const requestTypes = [
  { value: "vacation", label: "Vacation Request", icon: Palmtree, color: "bg-blue-500" },
  { value: "sick_day", label: "Sick Day", icon: Heart, color: "bg-red-500" },
  { value: "free_day", label: "Free Day", icon: Calendar, color: "bg-green-500" },
  { value: "meeting", label: "Special Meeting", icon: UserPlus, color: "bg-purple-500" },
  { value: "suggestion", label: "Suggestion Box", icon: MessageSquare, color: "bg-yellow-500" },
  { value: "paperwork", label: "Paperwork Request", icon: FileText, color: "bg-gray-500" },
];

export default function EmployeeRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    request_type: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("employee_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching requests", variant: "destructive" });
    } else {
      setRequests(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("employee_requests").insert({
      user_id: user.id,
      ...formData,
    });

    if (error) {
      toast({ title: "Error creating request", variant: "destructive" });
    } else {
      toast({ title: "Request submitted successfully!" });
      setIsOpen(false);
      setFormData({
        request_type: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
      });
      fetchRequests();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      approved: "bg-green-500/20 text-green-700 dark:text-green-300",
      rejected: "bg-red-500/20 text-red-700 dark:text-red-300",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const getTypeInfo = (type: string) => {
    return requestTypes.find((t) => t.value === type) || requestTypes[0];
  };

  const needsDateRange = ["vacation", "sick_day", "free_day"].includes(formData.request_type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Requests</h2>
          <p className="text-muted-foreground">Submit and track your requests</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>New Request</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Request Type</Label>
                <Select value={formData.request_type} onValueChange={(value) => setFormData({ ...formData, request_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for your request"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={4}
                />
              </div>

              {needsDateRange && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No requests yet. Create your first request!
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => {
            const typeInfo = getTypeInfo(request.request_type);
            const TypeIcon = typeInfo.icon;
            return (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                {request.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    {request.start_date && (
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(request.start_date).toLocaleDateString()}
                        </span>
                        {request.end_date && (
                          <>
                            <span>→</span>
                            <span>{new Date(request.end_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
