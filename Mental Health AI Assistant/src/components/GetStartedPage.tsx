import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Brain, Shield, Users, Heart, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";

interface GetStartedPageProps {
  onBack: () => void;
  onStartAssessment: () => void;
  onComplete?: () => void;
}

type OnboardingStep = 'welcome' | 'goals' | 'experience' | 'preferences' | 'ready';

const mentalHealthGoals = [
  { id: 'anxiety', label: 'Manage anxiety and stress', icon: Brain },
  { id: 'depression', label: 'Address feelings of depression', icon: Heart },
  { id: 'sleep', label: 'Improve sleep quality', icon: Brain },
  { id: 'relationships', label: 'Better relationships', icon: Users },
  { id: 'work-stress', label: 'Work-life balance', icon: Brain },
  { id: 'self-awareness', label: 'Increase self-awareness', icon: Brain },
  { id: 'trauma', label: 'Process past experiences', icon: Shield },
  { id: 'general', label: 'General mental wellness', icon: Heart }
];

const experienceLevels = [
  {
    id: 'first-time',
    title: 'First time seeking help',
    description: 'This is my first time actively working on my mental health'
  },
  {
    id: 'some-experience',
    title: 'Some experience',
    description: 'I\'ve tried self-help resources or had brief counseling before'
  },
  {
    id: 'experienced',
    title: 'Experienced',
    description: 'I\'ve worked with mental health professionals and know what works for me'
  }
];

export function GetStartedPage({ onBack, onStartAssessment, onComplete }: GetStartedPageProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [preferences, setPreferences] = useState({
    reminderFrequency: '',
    dataSharing: '',
    communicationStyle: ''
  });

  const steps = ['welcome', 'goals', 'experience', 'preferences', 'ready'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'goals':
        return selectedGoals.length > 0;
      case 'experience':
        return experienceLevel !== '';
      case 'preferences':
        return preferences.reminderFrequency !== '' && preferences.dataSharing !== '';
      case 'ready':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex] as OnboardingStep);
    } else {
      // User has completed onboarding, redirect to dashboard
      if (onComplete) {
        onComplete();
      } else {
        onStartAssessment();
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex] as OnboardingStep);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 'welcome' ? 'Back to Home' : 'Previous'}
        </Button>

        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <Card className="p-8">
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl mb-4">Welcome to MindCare AI</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Let's personalize your mental health journey in just a few steps.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 my-8">
                <div className="text-center p-4">
                  <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="mb-1">Private & Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your information is encrypted and never shared without consent
                  </p>
                </div>
                <div className="text-center p-4">
                  <Brain className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="mb-1">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations based on evidence-based practices
                  </p>
                </div>
                <div className="text-center p-4">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="mb-1">Professional Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with licensed professionals when you're ready
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> MindCare AI provides support and insights but is not a replacement 
                  for professional medical care. If you're experiencing a mental health emergency, 
                  please contact emergency services or call 988.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'goals' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl mb-4">What are your mental health goals?</h2>
                <p className="text-muted-foreground">
                  Select all that apply. This helps us provide more relevant insights and resources.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {mentalHealthGoals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoals.includes(goal.id);
                  
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleGoalToggle(goal.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {isSelected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span className={isSelected ? 'font-medium' : ''}>{goal.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 'experience' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl mb-4">What's your experience with mental health support?</h2>
                <p className="text-muted-foreground">
                  This helps us tailor our approach to your comfort level and needs.
                </p>
              </div>

              <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                <div className="space-y-4">
                  {experienceLevels.map((level) => (
                    <div key={level.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={level.id} className="cursor-pointer">
                          <div className="font-medium mb-1">{level.title}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Separator />

              <div className="space-y-3">
                <Label>Anything else you'd like us to know? (Optional)</Label>
                <Textarea
                  placeholder="Share any specific concerns, preferences, or context that might help us support you better..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === 'preferences' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl mb-4">Set your preferences</h2>
                <p className="text-muted-foreground">
                  Customize how MindCare AI works for you.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-4 block">How often would you like check-in reminders?</Label>
                  <RadioGroup 
                    value={preferences.reminderFrequency} 
                    onValueChange={(value) => setPreferences(prev => ({...prev, reminderFrequency: value}))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="biweekly" id="biweekly" />
                      <Label htmlFor="biweekly">Bi-weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">No reminders</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base mb-4 block">Data sharing for research (anonymous)</Label>
                  <RadioGroup 
                    value={preferences.dataSharing} 
                    onValueChange={(value) => setPreferences(prev => ({...prev, dataSharing: value}))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="share-yes" />
                      <Label htmlFor="share-yes">Yes, help improve mental health research</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="share-no" />
                      <Label htmlFor="share-no">No, keep my data private</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your data would be anonymized and used only for improving mental health tools and research.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'ready' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl mb-4">You're all set!</h2>
                <p className="text-muted-foreground mb-6">
                  Your personalized mental health journey is ready to begin. 
                  Let's start with your first assessment.
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h3>Your Goals:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedGoals.map(goalId => {
                    const goal = mentalHealthGoals.find(g => g.id === goalId);
                    return goal ? (
                      <Badge key={goalId} variant="secondary">
                        {goal.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The assessment takes about 10-15 minutes and will help us understand 
                  your current mental health status.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your responses are private and secure</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'welcome'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
            >
              {currentStep === 'ready' ? (onComplete ? 'Complete Setup' : 'Start Assessment') : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}