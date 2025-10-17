import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeKPISurveyProps {
  onBack: () => void;
}

const moodEmojis = [
  { emoji: "😟", label: "Needs Support", value: 1 },
  { emoji: "😐", label: "On Track", value: 2 },
  { emoji: "🌟", label: "Excelling", value: 3 },
];

// Mock employees data
const mockEmployees = [
  { id: "emp-1", name: "John Smith", role: "Software Engineer" },
  { id: "emp-2", name: "Sarah Johnson", role: "Product Designer" },
  { id: "emp-3", name: "Michael Williams", role: "Marketing Manager" },
  { id: "emp-4", name: "Emily Brown", role: "Sales Representative" },
  { id: "emp-5", name: "David Jones", role: "Data Analyst" },
  { id: "emp-6", name: "Jessica Garcia", role: "HR Specialist" },
];

export default function EmployeeKPISurvey({ onBack }: EmployeeKPISurveyProps) {
  const { toast } = useToast();
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, { mood: number | null; kpi: number; feedback: string }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentEmployee = mockEmployees[currentEmployeeIndex];
  const progress = ((currentEmployeeIndex + 1) / mockEmployees.length) * 100;

  const currentResponse = responses[currentEmployee.id] || {
    mood: null,
    kpi: 3,
    feedback: "",
  };

  const handleMoodSelect = (value: number) => {
    setResponses({
      ...responses,
      [currentEmployee.id]: { ...currentResponse, mood: value },
    });
  };

  const handleKPIChange = (value: number[]) => {
    setResponses({
      ...responses,
      [currentEmployee.id]: { ...currentResponse, kpi: value[0] },
    });
  };

  const handleFeedbackChange = (value: string) => {
    setResponses({
      ...responses,
      [currentEmployee.id]: { ...currentResponse, feedback: value },
    });
  };

  const handleNext = async () => {
    if (!currentResponse.mood) {
      toast({
        title: "Please select a performance rating",
        description: "Choose an emoji to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentEmployeeIndex < mockEmployees.length - 1) {
      setCurrentEmployeeIndex(currentEmployeeIndex + 1);
    } else {
      await handleSubmitAll();
    }
  };

  const handleBack = () => {
    if (currentEmployeeIndex > 0) {
      setCurrentEmployeeIndex(currentEmployeeIndex - 1);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit surveys",
          variant: "destructive",
        });
        return;
      }

      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartDate = weekStart.toISOString().split("T")[0];

      const surveysToInsert = Object.entries(responses)
        .filter(([_, response]) => response.mood !== null)
        .map(([employeeId, response]) => ({
          manager_id: user.id,
          employee_id: employeeId,
          employee_name:
            mockEmployees.find((e) => e.id === employeeId)?.name || "Unknown",
          mood_rating: response.mood!,
          kpi_score: response.kpi,
          kpi_feedback: response.feedback || null,
          week_start_date: weekStartDate,
        }));

      const { error } = await supabase
        .from("employee_kpi_surveys")
        .insert(surveysToInsert);

      if (error) throw error;

      toast({
        title: "KPI surveys submitted!",
        description: `Submitted feedback for ${surveysToInsert.length} employees`,
      });
      onBack();
    } catch (error) {
      console.error("Error submitting surveys:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting the surveys",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = Object.values(responses).filter((r) => r.mood !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge variant="secondary">
          <CheckCircle className="w-3 h-3 mr-1" />
          {completedCount} / {mockEmployees.length} completed
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Weekly KPI Pulse</span>
              <span>
                Employee {currentEmployeeIndex + 1} of {mockEmployees.length}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Survey Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl">
                {currentEmployee.name}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {currentEmployee.role}
              </CardDescription>
            </div>
            <Badge>90 sec</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Mood Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How is this employee performing?</h3>
            <div className="flex justify-center gap-4 md:gap-8">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`flex flex-col items-center gap-2 p-6 rounded-2xl transition-all hover:scale-110 ${
                    currentResponse.mood === mood.value
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-6xl md:text-7xl">{mood.emoji}</span>
                  <span className="text-sm font-medium text-center">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI Score */}
          <div className="space-y-6 px-4">
            <h3 className="font-semibold text-lg">Overall KPI Score</h3>
            <div className="text-center">
              <span className="text-5xl font-bold text-primary">{currentResponse.kpi}</span>
              <span className="text-muted-foreground text-lg">/5</span>
            </div>
            <Slider
              value={[currentResponse.kpi]}
              onValueChange={handleKPIChange}
              max={5}
              min={0}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Needs Improvement</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Optional Feedback */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Feedback (Optional)</h3>
            <Textarea
              placeholder="Share any specific observations or notes..."
              value={currentResponse.feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentEmployeeIndex === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? (
            "Submitting..."
          ) : currentEmployeeIndex === mockEmployees.length - 1 ? (
            "Submit All"
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
