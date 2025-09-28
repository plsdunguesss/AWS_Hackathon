import { ArrowLeft, Book, Phone, Video, Users, ExternalLink, Heart, Brain, Moon, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ResourcesPageProps {
  onBack: () => void;
}

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    description: "24/7 crisis support for people in suicidal crisis or emotional distress",
    contact: "988",
    type: "phone",
    available: "24/7"
  },
  {
    name: "Crisis Text Line",
    description: "Free, confidential, 24/7 crisis support via text message",
    contact: "Text HOME to 741741",
    type: "text",
    available: "24/7"
  },
  {
    name: "SAMHSA National Helpline",
    description: "Treatment referral and information service for mental health and substance abuse",
    contact: "1-800-662-4357",
    type: "phone",
    available: "24/7"
  },
  {
    name: "National Domestic Violence Hotline",
    description: "Support for domestic violence survivors and their loved ones",
    contact: "1-800-799-7233",
    type: "phone",
    available: "24/7"
  }
];

const selfHelpResources = [
  {
    title: "Mindfulness & Meditation",
    description: "Learn techniques to reduce stress and improve mental clarity",
    icon: Brain,
    category: "Stress Management",
    resources: [
      "Guided meditation exercises",
      "Breathing techniques",
      "Mindfulness practices for daily life"
    ]
  },
  {
    title: "Sleep Hygiene",
    description: "Improve your sleep quality with proven strategies",
    icon: Moon,
    category: "Sleep Health",
    resources: [
      "Sleep schedule optimization",
      "Bedtime routine creation",
      "Environment setup for better sleep"
    ]
  },
  {
    title: "Anxiety Management",
    description: "Tools and techniques to cope with anxiety",
    icon: Heart,
    category: "Anxiety",
    resources: [
      "Grounding techniques",
      "Progressive muscle relaxation",
      "Cognitive restructuring exercises"
    ]
  },
  {
    title: "Building Resilience",
    description: "Strengthen your ability to bounce back from challenges",
    icon: Activity,
    category: "Personal Growth",
    resources: [
      "Stress inoculation training",
      "Problem-solving skills",
      "Social support building"
    ]
  }
];

const educationalContent = [
  {
    title: "Understanding Depression",
    description: "Learn about symptoms, causes, and treatment options for depression",
    readTime: "8 min read",
    category: "Mental Health Conditions"
  },
  {
    title: "Anxiety Disorders Explained",
    description: "Comprehensive guide to different types of anxiety disorders",
    readTime: "12 min read",
    category: "Mental Health Conditions"
  },
  {
    title: "The Importance of Mental Health",
    description: "Why mental health matters and how to prioritize it",
    readTime: "6 min read",
    category: "General Wellness"
  },
  {
    title: "Supporting a Loved One",
    description: "How to help someone who may be struggling with mental health",
    readTime: "10 min read",
    category: "Support & Care"
  },
  {
    title: "Workplace Mental Health",
    description: "Managing stress and maintaining wellbeing at work",
    readTime: "7 min read",
    category: "Professional Life"
  },
  {
    title: "Teen Mental Health",
    description: "Understanding mental health challenges in adolescence",
    readTime: "9 min read",
    category: "Age-Specific"
  }
];

const onlineTools = [
  {
    name: "Mood Tracker",
    description: "Track your daily mood and identify patterns over time",
    icon: Activity,
    type: "Interactive Tool"
  },
  {
    name: "Breathing Exercise",
    description: "Guided breathing exercises for immediate stress relief",
    icon: Heart,
    type: "Wellness Tool"
  },
  {
    name: "Gratitude Journal",
    description: "Daily prompts to practice gratitude and positive thinking",
    icon: Book,
    type: "Journaling Tool"
  },
  {
    name: "Sleep Calculator",
    description: "Find the optimal bedtime based on your wake-up time",
    icon: Moon,
    type: "Health Tool"
  }
];

export function ResourcesPage({ onBack }: ResourcesPageProps) {
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl mb-4">Mental Health Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Access a comprehensive collection of mental health resources, self-help tools, 
            educational content, and crisis support information.
          </p>
        </div>

        <Tabs defaultValue="crisis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
            <TabsTrigger value="selfhelp">Self-Help</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="tools">Online Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="crisis" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Immediate Crisis Support</h2>
              <p className="text-muted-foreground">
                If you're in crisis or need immediate support, these resources are available 24/7.
              </p>
            </div>

            <div className="grid gap-4">
              {crisisResources.map((resource, index) => (
                <Card key={index} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="h-5 w-5 text-red-600" />
                        <h3 className="text-xl">{resource.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {resource.available}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {resource.type === 'phone' ? 'Phone' : 'Text'}
                        </Badge>
                        <span className="font-medium">{resource.contact}</span>
                      </div>
                    </div>
                    <Button size="lg" className="md:w-auto">
                      Get Help Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <Phone className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="text-red-800 mb-2">Emergency Situations</h3>
                  <p className="text-red-700 mb-3">
                    If you or someone you know is in immediate danger, please call emergency services.
                  </p>
                  <Button variant="destructive" size="lg">
                    Call 911
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="selfhelp" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Self-Help Resources</h2>
              <p className="text-muted-foreground">
                Evidence-based tools and techniques you can use to support your mental health.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {selfHelpResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs">
                          {resource.category}
                        </Badge>
                        <h3 className="mb-2">{resource.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {resource.resources.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Explore Resources
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Educational Content</h2>
              <p className="text-muted-foreground">
                Learn more about mental health conditions, treatments, and wellness strategies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalContent.map((article, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <h3>{article.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {article.readTime}
                      </span>
                      <Button variant="ghost" size="sm">
                        Read More
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Interactive Tools</h2>
              <p className="text-muted-foreground">
                Use these interactive tools to support your mental health journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {onlineTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {tool.type}
                        </Badge>
                        <h3>{tool.name}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      {tool.description}
                    </p>
                    <Button className="w-full">
                      Try Tool
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Card>
                );
              })}
            </div>

            <Card className="p-6 bg-muted/50">
              <div className="text-center">
                <h3 className="mb-2">More Tools Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  We're constantly adding new interactive tools to support your mental health journey.
                </p>
                <Button variant="outline">
                  Request a Tool
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}