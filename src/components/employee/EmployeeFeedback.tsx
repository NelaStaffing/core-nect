import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";

const categories = [
  { value: "work-environment", label: "Work Environment" },
  { value: "team-collaboration", label: "Team Collaboration" },
  { value: "management", label: "Management" },
  { value: "tools-resources", label: "Tools & Resources" },
  { value: "other", label: "Other" },
];

export default function EmployeeFeedback() {
  const [category, setCategory] = useState("work-environment");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide your feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feedback submitted!",
      description: "Thank you for helping us improve",
    });

    // Reset form
    setCategory("work-environment");
    setRating(0);
    setFeedback("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Feedback</h1>
        <p className="text-muted-foreground text-lg">
          Your voice matters - share your thoughts with us
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Help us create a better workplace by sharing your honest feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Feedback Category</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div key={cat.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat.value} id={cat.value} />
                    <Label htmlFor={cat.value} className="cursor-pointer">
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label>Overall Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-3">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              className="min-h-[150px]"
            />
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full" size="lg">
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Feedback</CardTitle>
          <CardDescription>Feedback you've submitted in the past</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                date: "March 20, 2025",
                category: "Work Environment",
                status: "Under Review",
              },
              {
                date: "March 10, 2025",
                category: "Tools & Resources",
                status: "Addressed",
              },
              {
                date: "February 28, 2025",
                category: "Team Collaboration",
                status: "Addressed",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.status === "Addressed"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
