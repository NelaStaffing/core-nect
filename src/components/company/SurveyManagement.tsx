import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  created_at: string;
}

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState<{
    title: string;
    description: string;
    status: 'draft' | 'active' | 'closed';
  }>({
    title: "",
    description: "",
    status: "draft",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSurveys(data as Survey[]);
    }
  };

  const handleCreateSurvey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('surveys')
      .insert([{
        ...newSurvey,
        company_id: user.id,
        created_by: user.id,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create survey",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Survey created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewSurvey({ title: "", description: "", status: "draft" });
      fetchSurveys();
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });
      fetchSurveys();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'closed': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Survey Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage employee surveys
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new survey
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  placeholder="Employee Satisfaction Survey"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                  placeholder="Help us understand your experience..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newSurvey.status}
                  onValueChange={(value) => 
                    setNewSurvey({ ...newSurvey, status: value as 'draft' | 'active' | 'closed' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateSurvey} className="w-full">
                Create Survey
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <Card key={survey.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle>{survey.title}</CardTitle>
                  <CardDescription>{survey.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(survey.status)}>
                    {survey.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteSurvey(survey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created {new Date(survey.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}