import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function RequestsManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("employee_requests")
      .select("*, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching requests", variant: "destructive" });
    } else {
      setRequests(data || []);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: "approved" | "rejected") => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("employee_requests")
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({ title: "Error updating request", variant: "destructive" });
    } else {
      toast({ title: `Request ${status}!` });
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

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: "Vacation",
      sick_day: "Sick Day",
      free_day: "Free Day",
      meeting: "Special Meeting",
      suggestion: "Suggestion",
      paperwork: "Paperwork",
    };
    return labels[type] || type;
  };

  const filterByStatus = (status: string) => {
    return requests.filter((r) => r.status === status);
  };

  const renderRequests = (filteredRequests: any[]) => {
    if (filteredRequests.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No requests in this category
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>
                      {request.profiles?.first_name} {request.profiles?.last_name}
                    </span>
                    <span>•</span>
                    <Badge variant="outline">{getRequestTypeLabel(request.request_type)}</Badge>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.description && (
                <p className="text-sm text-muted-foreground">{request.description}</p>
              )}
              
              {request.start_date && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
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

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                Submitted {new Date(request.created_at).toLocaleString()}
              </div>

              {request.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(request.id, "approved")}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUpdateStatus(request.id, "rejected")}
                    disabled={loading}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Employee Requests</h2>
        <p className="text-muted-foreground">Review and manage employee requests</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{filterByStatus("pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{filterByStatus("approved").length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{filterByStatus("rejected").length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({filterByStatus("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filterByStatus("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterByStatus("rejected").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {renderRequests(filterByStatus("pending"))}
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          {renderRequests(filterByStatus("approved"))}
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          {renderRequests(filterByStatus("rejected"))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
