import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, Trash2, Download, Search, Bot, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Resource {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description: string | null;
  category: string | null;
  created_at: string;
}

export default function ResourcesManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [aiDocQAEnabled, setAiDocQAEnabled] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exampleQA, setExampleQA] = useState<{ question: string; answer: string }[]>([]);
  const { toast } = useToast();

  const categories = ["Documentation", "SOP", "Training", "Policy", "Guide", "Other"];
  const MIN_DOCS_REQUIRED = 3;

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("company_resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      });
    } else {
      setResources(data || []);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-resources")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("company_resources")
        .insert({
          company_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          category: "Other",
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      fetchResources();
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("company-resources")
        .remove([resource.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("company_resources")
        .delete()
        .eq("id", resource.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });

      fetchResources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const { data, error } = await supabase.storage
        .from("company-resources")
        .download(resource.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (resourceId: string, category: string) => {
    try {
      const { error } = await supabase
        .from("company_resources")
        .update({ category })
        .eq("id", resourceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated",
      });

      fetchResources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getDocumentationResources = () => {
    return resources.filter(r => 
      r.category === "Documentation" || 
      r.category === "SOP" || 
      r.category === "Policy"
    );
  };

  const hasEnoughDocumentation = () => {
    return getDocumentationResources().length >= MIN_DOCS_REQUIRED;
  };

  const generateExampleQA = () => {
    const docs = getDocumentationResources();
    return [
      {
        question: "What is our company's remote work policy?",
        answer: `Based on ${docs.length} documentation files, I can help answer questions about company policies, procedures, and guidelines.`
      },
      {
        question: "How do I submit a vacation request?",
        answer: "I can guide you through the process using our documented procedures."
      },
      {
        question: "What are the steps for onboarding new employees?",
        answer: "I have access to SOPs and training materials to provide detailed onboarding information."
      }
    ];
  };

  const handleToggleDocQA = (checked: boolean) => {
    if (checked) {
      if (!hasEnoughDocumentation()) {
        toast({
          title: "Insufficient Documentation",
          description: `Please upload at least ${MIN_DOCS_REQUIRED} documentation files (Documentation, SOP, or Policy categories) to enable AI Q&A.`,
          variant: "destructive",
        });
        return;
      }
      setExampleQA(generateExampleQA());
      setShowConfirmDialog(true);
    } else {
      setAiDocQAEnabled(false);
      toast({
        title: "AI Documentation Q&A Disabled",
        description: "The AI assistant will no longer answer questions based on company documentation.",
      });
    }
  };

  const confirmEnableDocQA = () => {
    setAiDocQAEnabled(true);
    setShowConfirmDialog(false);
    toast({
      title: "AI Documentation Q&A Enabled",
      description: "The AI assistant can now answer questions based on your company documentation.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Resources & Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload company documents, SOPs, and training materials for AI-powered employee assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload File"}
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Supports all document types (PDF, DOCX, TXT, etc.)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Abilities & Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="doc-qa" className="text-base font-medium">
                    Answer Questions on Company Documentation
                  </Label>
                  <Switch
                    id="doc-qa"
                    checked={aiDocQAEnabled}
                    onCheckedChange={handleToggleDocQA}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable AI to answer employee questions based on uploaded documentation
                </p>
              </div>
            </div>

            {hasEnoughDocumentation() ? (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Ready to enable
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {getDocumentationResources().length} documentation files available
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    More data needed
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Upload at least {MIN_DOCS_REQUIRED} files in Documentation, SOP, or Policy categories ({getDocumentationResources().length}/{MIN_DOCS_REQUIRED} uploaded)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" title={resource.file_name}>
                      {resource.file_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(resource.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              <Select
                value={resource.category || "Other"}
                onValueChange={(value) => handleUpdateCategory(resource.id, value)}
              >
                <SelectTrigger className="w-full mb-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(resource)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(resource)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Uploaded {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "No resources match your search"
                : "No resources uploaded yet. Upload your first document to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Enable AI Documentation Q&A</AlertDialogTitle>
            <AlertDialogDescription>
              The AI assistant will be able to answer questions based on your uploaded documentation. Here are some example questions it can handle:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 my-4">
            {exampleQA.map((qa, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">{qa.question}</p>
                    <p className="text-sm text-muted-foreground">{qa.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnableDocQA}>
              Enable AI Q&A
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
