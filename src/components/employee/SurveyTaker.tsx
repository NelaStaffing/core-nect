import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SurveyTakerProps {
  onBack: () => void;
}

const moodEmojis = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "😊", label: "Happy", value: 3 },
];

const weeklyPulseQuestions = [
  {
    id: 1,
    type: "mood",
    question: "What are you like today?",
  },
  {
    id: 2,
    type: "scale",
    question: "How satisfied are you with your work-life balance?",
  },
  {
    id: 3,
    type: "yesno",
    question: "Do you feel valued by your team?",
  },
  {
    id: 4,
    type: "rating",
    question: "How would you rate team collaboration this week?",
  },
  {
    id: 5,
    type: "scale",
    question: "How aligned do you feel with company values?",
  },
];

export default function SurveyTaker({ onBack }: SurveyTakerProps) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});

  const progress = ((currentQuestion + 1) / weeklyPulseQuestions.length) * 100;
  const question = weeklyPulseQuestions[currentQuestion];

  const handleMoodSelect = (value: number) => {
    setResponses({ ...responses, [question.id]: value });
  };

  const handleScaleChange = (value: number[]) => {
    setResponses({ ...responses, [question.id]: value[0] });
  };

  const handleYesNoSelect = (value: boolean) => {
    setResponses({ ...responses, [question.id]: value });
  };

  const handleRatingSelect = (value: string) => {
    setResponses({ ...responses, [question.id]: value });
  };

  const handleNext = () => {
    if (!responses[question.id] && responses[question.id] !== 0) {
      toast({
        title: "Please answer the question",
        description: "Select an option to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < weeklyPulseQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Survey submitted!",
      description: "Thank you for your feedback",
    });
    onBack();
  };

  const handleSkip = () => {
    toast({
      title: "Survey skipped",
      description: "You can complete it later from the surveys page",
    });
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Weekly Pulse Survey</span>
            <span>
              {currentQuestion + 1} of {weeklyPulseQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center">
              {question.question}
            </CardTitle>
            <CardDescription className="text-center">60-second weekly pulse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Mood Selection */}
            {question.type === "mood" && (
              <div className="flex justify-center gap-4 md:gap-8">
                {moodEmojis.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-2xl transition-all hover:scale-110 ${
                      responses[question.id] === mood.value
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <span className="text-6xl md:text-7xl">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Scale Slider (0-5) */}
            {question.type === "scale" && (
              <div className="space-y-6 px-4">
                <div className="text-center">
                  <span className="text-5xl font-bold text-primary">
                    {responses[question.id] ?? 3}
                  </span>
                  <span className="text-muted-foreground text-lg">/5</span>
                </div>
                <Slider
                  value={[responses[question.id] ?? 3]}
                  onValueChange={handleScaleChange}
                  max={5}
                  min={0}
                  step={1}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Not at all</span>
                  <span>Extremely</span>
                </div>
              </div>
            )}

            {/* Yes/No */}
            {question.type === "yesno" && (
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  variant={responses[question.id] === true ? "default" : "outline"}
                  onClick={() => handleYesNoSelect(true)}
                  className="w-32 h-20 text-lg"
                >
                  Yes
                </Button>
                <Button
                  size="lg"
                  variant={responses[question.id] === false ? "default" : "outline"}
                  onClick={() => handleYesNoSelect(false)}
                  className="w-32 h-20 text-lg"
                >
                  No
                </Button>
              </div>
            )}

            {/* Rating (Bad, Good, Great) */}
            {question.type === "rating" && (
              <div className="flex justify-center gap-4">
                {["Bad", "Good", "Great"].map((rating) => (
                  <Button
                    key={rating}
                    size="lg"
                    variant={responses[question.id] === rating ? "default" : "outline"}
                    onClick={() => handleRatingSelect(rating)}
                    className="w-28 h-20 text-lg"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentQuestion === weeklyPulseQuestions.length - 1 ? (
              "Submit"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
