import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const surveys = [
  {
    id: 1,
    title: "Q1 Employee Satisfaction Survey",
    description: "Help us understand your experience and satisfaction at work",
    status: "pending",
    deadline: "March 30, 2025",
    duration: "5 min",
  },
  {
    id: 2,
    title: "Training Effectiveness Survey",
    description: "Share your feedback on recent training programs",
    status: "pending",
    deadline: "April 5, 2025",
    duration: "3 min",
  },
  {
    id: 3,
    title: "Team Collaboration Assessment",
    description: "Evaluate team dynamics and collaboration tools",
    status: "completed",
    deadline: "March 15, 2025",
    duration: "4 min",
  },
  {
    id: 4,
    title: "Workplace Environment Survey",
    description: "Rate your workspace comfort and facilities",
    status: "completed",
    deadline: "March 1, 2025",
    duration: "2 min",
  },
];

export default function EmployeeSurveys() {
  const pendingSurveys = surveys.filter((s) => s.status === "pending");
  const completedSurveys = surveys.filter((s) => s.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Surveys</h1>
        <p className="text-muted-foreground text-lg">
          Share your thoughts and help us improve
        </p>
      </div>

      {/* Pending Surveys */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          Pending Surveys ({pendingSurveys.length})
        </h2>
        <div className="grid gap-4">
          {pendingSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{survey.duration}</span>
                    </div>
                    <span>Due: {survey.deadline}</span>
                  </div>
                  <Button>Start Survey</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Surveys */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          Completed Surveys ({completedSurveys.length})
        </h2>
        <div className="grid gap-4">
          {completedSurveys.map((survey) => (
            <Card key={survey.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Completed on {survey.deadline}
                  </div>
                  <Button variant="outline">View Results</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
