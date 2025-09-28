import { AlertTriangle, CheckCircle, Info, ArrowLeft, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { AssessmentResults } from "./AssessmentForm";

interface ResultsDisplayProps {
  results: AssessmentResults;
  onBack: () => void;
  onViewProfessionals: () => void;
}

export function ResultsDisplay({ results, onBack, onViewProfessionals }: ResultsDisplayProps) {
  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          title: 'Low Risk',
          description: 'Your responses suggest good mental wellness with minimal concerns.'
        };
      case 'moderate':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          icon: Info,
          title: 'Moderate Risk',
          description: 'Your responses indicate some areas that may benefit from attention and support.'
        };
      case 'high':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: AlertTriangle,
          title: 'Higher Risk',
          description: 'Your responses suggest significant concerns that would benefit from professional support.'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: Info,
          title: 'Assessment Complete',
          description: 'Thank you for completing the assessment.'
        };
    }
  };

  const riskInfo = getRiskLevelInfo(results.riskLevel);
  const RiskIcon = riskInfo.icon;

  const categoryNames: Record<string, string> = {
    anxiety: 'Anxiety',
    depression: 'Depression',
    stress: 'Stress',
    sleep: 'Sleep',
    social: 'Social Comfort'
  };

  const getMaxCategoryScore = (category: string) => {
    const categoryQuestions = [
      { category: 'anxiety', maxScore: 6 }, // 2 questions, max 3 each
      { category: 'depression', maxScore: 6 }, // 2 questions, max 3 each
      { category: 'stress', maxScore: 8 }, // 2 questions, max 4 each
      { category: 'sleep', maxScore: 4 }, // 1 question, max 4
      { category: 'social', maxScore: 4 }, // 1 question, max 4
    ];
    return categoryQuestions.find(c => c.category === category)?.maxScore || 1;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>

        <div className="space-y-6">
          {/* Main Results Card */}
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${riskInfo.bgColor} mb-4`}>
                <RiskIcon className={`h-8 w-8 ${riskInfo.textColor}`} />
              </div>
              <h1 className="text-2xl mb-2">Assessment Results</h1>
              <Badge variant="outline" className={`${riskInfo.textColor} border-current`}>
                {riskInfo.title}
              </Badge>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                {riskInfo.description}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4 mb-8">
              <h3>Area Breakdown</h3>
              <div className="grid gap-4">
                {Object.entries(results.categoryScores).map(([category, score]) => {
                  const maxScore = getMaxCategoryScore(category);
                  const percentage = (score / maxScore) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{categoryNames[category] || category}</span>
                        <span>{score}/{maxScore}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Crisis Alert for High Risk */}
            {results.riskLevel === 'high' && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>If you're experiencing thoughts of self-harm or suicide, please reach out immediately:</strong>
                  <br />
                  • National Suicide Prevention Lifeline: 988
                  <br />
                  • Crisis Text Line: Text HOME to 741741
                  <br />
                  • Emergency Services: 911
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
              <h3>Personalized Recommendations</h3>
              <div className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Professional Help Card */}
          {(results.riskLevel === 'moderate' || results.riskLevel === 'high') && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2">Connect with Mental Health Professionals</h3>
                  <p className="text-muted-foreground">
                    Based on your results, speaking with a qualified mental health professional could be beneficial.
                  </p>
                </div>
                <Button onClick={onViewProfessionals}>
                  <Users className="mr-2 h-4 w-4" />
                  Find Professionals
                </Button>
              </div>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="p-6">
            <h3 className="mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4>Immediate Steps</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Save or screenshot these results</li>
                  <li>• Share with a trusted person if comfortable</li>
                  <li>• Consider the recommendations provided</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4>Long-term Wellness</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Regular self-check-ins</li>
                  <li>• Building healthy coping strategies</li>
                  <li>• Maintaining social connections</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Remember: This assessment provides insights but is not a medical diagnosis. 
              Always consult with qualified healthcare professionals for proper evaluation and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}