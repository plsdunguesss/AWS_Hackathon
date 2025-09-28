import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'social';
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: "1",
    question: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?",
    category: "anxiety",
    options: [
      { value: "0", label: "Not at all", score: 0 },
      { value: "1", label: "Several days", score: 1 },
      { value: "2", label: "More than half the days", score: 2 },
      { value: "3", label: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "2",
    question: "Over the last 2 weeks, how often have you felt down, depressed, or hopeless?",
    category: "depression",
    options: [
      { value: "0", label: "Not at all", score: 0 },
      { value: "1", label: "Several days", score: 1 },
      { value: "2", label: "More than half the days", score: 2 },
      { value: "3", label: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "3",
    question: "How would you rate your stress level over the past month?",
    category: "stress",
    options: [
      { value: "0", label: "Very low", score: 0 },
      { value: "1", label: "Low", score: 1 },
      { value: "2", label: "Moderate", score: 2 },
      { value: "3", label: "High", score: 3 },
      { value: "4", label: "Very high", score: 4 }
    ]
  },
  {
    id: "4",
    question: "How often do you have trouble falling or staying asleep?",
    category: "sleep",
    options: [
      { value: "0", label: "Never", score: 0 },
      { value: "1", label: "Rarely", score: 1 },
      { value: "2", label: "Sometimes", score: 2 },
      { value: "3", label: "Often", score: 3 },
      { value: "4", label: "Always", score: 4 }
    ]
  },
  {
    id: "5",
    question: "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?",
    category: "depression",
    options: [
      { value: "0", label: "Not at all", score: 0 },
      { value: "1", label: "Several days", score: 1 },
      { value: "2", label: "More than half the days", score: 2 },
      { value: "3", label: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "6",
    question: "How comfortable do you feel in social situations?",
    category: "social",
    options: [
      { value: "0", label: "Very comfortable", score: 0 },
      { value: "1", label: "Somewhat comfortable", score: 1 },
      { value: "2", label: "Neutral", score: 2 },
      { value: "3", label: "Somewhat uncomfortable", score: 3 },
      { value: "4", label: "Very uncomfortable", score: 4 }
    ]
  },
  {
    id: "7",
    question: "Over the last 2 weeks, how often have you been unable to stop or control worrying?",
    category: "anxiety",
    options: [
      { value: "0", label: "Not at all", score: 0 },
      { value: "1", label: "Several days", score: 1 },
      { value: "2", label: "More than half the days", score: 2 },
      { value: "3", label: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "8",
    question: "How often do you feel overwhelmed by daily responsibilities?",
    category: "stress",
    options: [
      { value: "0", label: "Never", score: 0 },
      { value: "1", label: "Rarely", score: 1 },
      { value: "2", label: "Sometimes", score: 2 },
      { value: "3", label: "Often", score: 3 },
      { value: "4", label: "Always", score: 4 }
    ]
  }
];

interface AssessmentFormProps {
  onComplete: (results: AssessmentResults) => void;
  onBack: () => void;
}

export interface AssessmentResults {
  scores: Record<string, number>;
  totalScore: number;
  categoryScores: Record<string, number>;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export function AssessmentForm({ onComplete, onBack }: AssessmentFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const categoryScores: Record<string, number> = {};
    let totalScore = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.score;
          categoryScores[question.category] = (categoryScores[question.category] || 0) + option.score;
        }
      }
    });

    const maxPossibleScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
    const scorePercentage = (totalScore / maxPossibleScore) * 100;

    let riskLevel: 'low' | 'moderate' | 'high';
    let recommendations: string[];

    if (scorePercentage < 30) {
      riskLevel = 'low';
      recommendations = [
        "Continue maintaining healthy habits",
        "Consider mindfulness or meditation practices",
        "Stay connected with friends and family"
      ];
    } else if (scorePercentage < 60) {
      riskLevel = 'moderate';
      recommendations = [
        "Consider speaking with a counselor or therapist",
        "Practice stress management techniques",
        "Maintain a regular sleep schedule",
        "Engage in regular physical activity"
      ];
    } else {
      riskLevel = 'high';
      recommendations = [
        "We strongly recommend speaking with a mental health professional",
        "Consider contacting a crisis helpline if you're in immediate distress",
        "Reach out to trusted friends or family members",
        "Explore therapy options in your area"
      ];
    }

    const results: AssessmentResults = {
      scores: answers,
      totalScore,
      categoryScores,
      riskLevel,
      recommendations
    };

    onComplete(results);
  };

  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-6">{currentQ.question}</h2>
              
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQ.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!hasAnswer}
              >
                {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}