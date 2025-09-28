import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Clock, AlertTriangle, Search, Filter, Heart, Users, Brain, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface FindHelpPageProps {
  onBack: () => void;
  onViewProfessionals: () => void;
}

const immediateHelpOptions = [
  {
    name: "National Suicide Prevention Lifeline",
    contact: "988",
    description: "24/7 crisis support and suicide prevention",
    type: "crisis",
    available: "24/7"
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Free, confidential crisis support via text",
    type: "crisis",
    available: "24/7"
  },
  {
    name: "SAMHSA Helpline",
    contact: "1-800-662-4357",
    description: "Mental health and substance abuse information",
    type: "information",
    available: "24/7"
  },
  {
    name: "Emergency Services",
    contact: "911",
    description: "For immediate life-threatening emergencies",
    type: "emergency",
    available: "24/7"
  }
];

const helpCategories = [
  {
    title: "Individual Therapy",
    description: "One-on-one sessions with licensed therapists",
    icon: Users,
    waitTime: "1-3 weeks",
    coverage: "Most insurance plans",
    bestFor: ["Depression", "Anxiety", "Trauma", "Personal growth"]
  },
  {
    title: "Group Therapy",
    description: "Supportive group sessions with peers",
    icon: Users,
    waitTime: "1-2 weeks",
    coverage: "Most insurance plans",
    bestFor: ["Social anxiety", "Addiction recovery", "Grief", "Relationship issues"]
  },
  {
    title: "Psychiatry",
    description: "Medical doctors who can prescribe medications",
    icon: Brain,
    waitTime: "2-6 weeks",
    coverage: "Most insurance plans",
    bestFor: ["Medication management", "Severe depression", "Bipolar disorder", "ADHD"]
  },
  {
    title: "Crisis Intervention",
    description: "Immediate support for mental health emergencies",
    icon: AlertTriangle,
    waitTime: "Immediate",
    coverage: "Emergency coverage",
    bestFor: ["Suicidal thoughts", "Psychosis", "Severe distress", "Safety concerns"]
  }
];

const supportGroups = [
  {
    name: "Depression Support Alliance",
    focus: "Depression and mood disorders",
    format: "In-person & Virtual",
    frequency: "Weekly",
    cost: "Free"
  },
  {
    name: "Anxiety Warriors",
    focus: "Anxiety disorders and panic attacks",
    format: "Virtual",
    frequency: "Bi-weekly",
    cost: "Free"
  },
  {
    name: "NAMI Support Groups",
    focus: "General mental health conditions",
    format: "In-person",
    frequency: "Monthly",
    cost: "Free"
  },
  {
    name: "Grief Recovery Network",
    focus: "Loss and bereavement",
    format: "In-person & Virtual",
    frequency: "Weekly",
    cost: "$10/session"
  }
];

const emergencyLocations = [
  {
    name: "Metro General Hospital",
    address: "1234 Healthcare Blvd",
    phone: "(555) 123-4567",
    distance: "2.3 miles",
    haspsychER: true,
    waitTime: "~45 min"
  },
  {
    name: "City Medical Center",
    address: "5678 Medical Ave",
    phone: "(555) 234-5678",
    distance: "3.7 miles",
    haspsychER: true,
    waitTime: "~30 min"
  },
  {
    name: "Community Crisis Center",
    address: "9012 Support St",
    phone: "(555) 345-6789",
    distance: "1.8 miles",
    haspsychER: false,
    waitTime: "~15 min"
  }
];

export function FindHelpPage({ onBack, onViewProfessionals }: FindHelpPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl mb-4">Find Mental Health Help</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Get connected with the right type of mental health support based on your needs and urgency level.
          </p>
        </div>

        {/* Crisis Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>In Crisis?</strong> If you're having thoughts of suicide or self-harm, please call 988 immediately 
            or go to your nearest emergency room. You don't have to face this alone.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="immediate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="immediate">Immediate Help</TabsTrigger>
            <TabsTrigger value="professional">Professional Care</TabsTrigger>
            <TabsTrigger value="support">Support Groups</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="immediate" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Immediate Support Available Now</h2>
              <p className="text-muted-foreground">
                These resources are available 24/7 for immediate mental health support and crisis intervention.
              </p>
            </div>

            <div className="grid gap-4">
              {immediateHelpOptions.map((option, index) => (
                <Card key={index} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {option.type === 'crisis' && <Heart className="h-5 w-5 text-red-600" />}
                        {option.type === 'emergency' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        {option.type === 'information' && <Phone className="h-5 w-5 text-blue-600" />}
                        <h3 className="text-xl">{option.name}</h3>
                        <Badge 
                          variant={option.type === 'emergency' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {option.available}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <div className="text-lg font-semibold">
                        {option.contact}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="lg" 
                        variant={option.type === 'emergency' ? 'destructive' : 'default'}
                        className="md:w-40"
                      >
                        Contact Now
                      </Button>
                      <Button variant="outline" size="sm" className="md:w-40">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Professional Mental Health Care</h2>
              <p className="text-muted-foreground">
                Connect with licensed mental health professionals for ongoing treatment and support.
              </p>
            </div>

            <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="mb-2">Browse Our Professional Directory</h3>
                  <p className="text-muted-foreground">
                    Find licensed therapists, counselors, and psychiatrists in your area.
                    Filter by specialty, insurance, and availability.
                  </p>
                </div>
                <Button onClick={onViewProfessionals} size="lg">
                  View Professionals
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2">{category.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Typical wait time:</span>
                        <span>{category.waitTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Insurance coverage:</span>
                        <span>{category.coverage}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Best for:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.bestFor.map((condition, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Find Providers
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Support Groups & Peer Support</h2>
              <p className="text-muted-foreground">
                Connect with others who understand your experiences through group support and peer programs.
              </p>
            </div>

            <div className="grid gap-4">
              {supportGroups.map((group, index) => (
                <Card key={index} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-xl">{group.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {group.cost}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        Focus: {group.focus}
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Format: </span>
                          <span>{group.format}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Meets: </span>
                          <span>{group.frequency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="md:w-32">
                        Join Group
                      </Button>
                      <Button variant="outline" size="sm" className="md:w-32">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-muted/50">
              <div className="text-center">
                <h3 className="mb-2">Start Your Own Support Group</h3>
                <p className="text-muted-foreground mb-4">
                  Don't see a group that fits your needs? We can help you start a new support group in your community.
                </p>
                <Button variant="outline">
                  Learn How to Start a Group
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Emergency Mental Health Services</h2>
              <p className="text-muted-foreground">
                Find immediate emergency mental health services and crisis intervention centers near you.
              </p>
            </div>

            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Call 911 immediately if:</strong> You or someone else is in immediate physical danger, 
                has seriously injured themselves, or is threatening immediate self-harm or suicide.
              </AlertDescription>
            </Alert>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your zip code or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button size="lg" className="md:w-40">
                  <Search className="mr-2 h-4 w-4" />
                  Find Locations
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {emergencyLocations.map((location, index) => (
                <Card key={index} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="text-xl">{location.name}</h3>
                        {location.haspsychER && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Psychiatric ER
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {location.address}
                      </p>
                      <div className="grid md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Distance: </span>
                          <span>{location.distance}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wait time: </span>
                          <span>{location.waitTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span>{location.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="md:w-32">
                        Get Directions
                      </Button>
                      <Button variant="outline" size="sm" className="md:w-32">
                        <Phone className="mr-2 h-3 w-3" />
                        Call
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}