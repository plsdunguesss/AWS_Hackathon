import { ArrowLeft, Brain, Shield, Users, Zap, Check, Star, ArrowRight, Heart, Award, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface LearnMorePageProps {
  onBack: () => void;
  onGetStarted: () => void;
  onStartAssessment: () => void;
}

const features = [
  {
    icon: Brain,
    title: "AI-Powered Assessment",
    description: "Evidence-based screening tools that provide personalized mental health insights"
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Bank-level encryption ensures your mental health data remains completely confidential"
  },
  {
    icon: Users,
    title: "Professional Network",
    description: "Connect with licensed therapists, counselors, and psychiatrists when you need professional support"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get immediate insights and recommendations based on your assessment responses"
  },
  {
    icon: Heart,
    title: "Holistic Approach",
    description: "Comprehensive evaluation covering anxiety, depression, stress, sleep, and social wellness"
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Take assessments and access resources anytime, anywhere, at your own pace"
  }
];

const howItWorks = [
  {
    step: 1,
    title: "Complete Assessment",
    description: "Take our 10-15 minute evidence-based mental health screening questionnaire"
  },
  {
    step: 2,
    title: "Get Insights",
    description: "Receive personalized results with risk assessment and tailored recommendations"
  },
  {
    step: 3,
    title: "Access Resources",
    description: "Explore self-help tools, educational content, and crisis support resources"
  },
  {
    step: 4,
    title: "Connect with Professionals",
    description: "Find and connect with licensed mental health professionals when ready"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Teacher",
    rating: 5,
    content: "MindCare AI helped me recognize my anxiety patterns and connected me with a therapist who truly understood my needs. The assessment was thorough yet accessible."
  },
  {
    name: "David L.",
    role: "Software Engineer",
    content: "As someone who was hesitant about seeking help, the anonymous assessment gave me the confidence to take the first step. The resources are incredibly valuable."
  },
  {
    name: "Maria K.",
    role: "Graduate Student",
    content: "The 24/7 availability was crucial during my stressful finals period. Having immediate access to coping strategies and crisis resources made all the difference."
  }
];

const faqs = [
  {
    question: "Is MindCare AI a replacement for therapy?",
    answer: "No, MindCare AI is not a replacement for professional therapy or medical treatment. We provide preliminary screening, educational resources, and connections to professional care. Always consult with qualified mental health professionals for diagnosis and treatment."
  },
  {
    question: "How accurate are the assessment results?",
    answer: "Our assessments use validated screening tools commonly used by mental health professionals. However, they provide preliminary insights only and should not be considered a clinical diagnosis. Professional evaluation is always recommended for comprehensive assessment."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use bank-level encryption and follow strict privacy protocols. Your personal information is never shared without your explicit consent, and all data is stored securely. You can delete your account and data at any time."
  },
  {
    question: "What if I'm in crisis?",
    answer: "If you're experiencing thoughts of self-harm or suicide, please call 988 (Suicide Prevention Lifeline) immediately or go to your nearest emergency room. MindCare AI also provides quick access to crisis resources and emergency contacts."
  },
  {
    question: "How much does it cost?",
    answer: "The basic assessment and educational resources are free. We also offer premium features like detailed progress tracking and priority professional matching for a small monthly fee. Financial assistance is available for those who need it."
  },
  {
    question: "Can I use this if I'm already in therapy?",
    answer: "Absolutely! Many users find MindCare AI helpful as a supplement to their existing therapy. You can share your assessment results with your therapist to enhance your treatment discussions."
  },
  {
    question: "What age groups can use MindCare AI?",
    answer: "Our platform is designed for adults 18 and older. We have specialized resources for different life stages, from college students to seniors. Parental consent and specialized tools are required for users under 18."
  },
  {
    question: "How often should I take the assessment?",
    answer: "We recommend taking the assessment monthly to track changes in your mental health over time. However, you can take it as often as you find helpful, especially during periods of stress or life changes."
  }
];

const benefits = [
  "Evidence-based screening tools",
  "Immediate, personalized results",
  "Crisis support resources",
  "Professional provider directory",
  "Educational content library",
  "Progress tracking over time",
  "24/7 accessibility",
  "Complete privacy protection"
];

export function LearnMorePage({ onBack, onGetStarted, onStartAssessment }: LearnMorePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <div className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl mb-6">
              AI-Powered Mental Health Support for Everyone
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              MindCare AI combines evidence-based mental health screening with personalized insights 
              and professional connections to support your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onStartAssessment} className="text-lg px-8">
                Try Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={onGetStarted} className="text-lg px-8">
                Get Started
              </Button>
            </div>
          </div>

          <Tabs defaultValue="features" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-12">
              {/* Features Grid */}
              <div>
                <h2 className="text-3xl text-center mb-12">Comprehensive Mental Health Support</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="p-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-muted/30 rounded-lg p-8">
                <h3 className="text-2xl text-center mb-8">What You Get</h3>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="how-it-works" className="space-y-12">
              <div>
                <h2 className="text-3xl text-center mb-12">How MindCare AI Works</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {howItWorks.map((step, index) => (
                    <Card key={index} className="p-6 text-center relative">
                      <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 text-white">
                        {step.step}
                      </div>
                      <h3 className="mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                      {index < howItWorks.length - 1 && (
                        <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground" />
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Assessment Preview */}
              <Card className="p-8">
                <h3 className="text-2xl mb-6 text-center">Sample Assessment Questions</h3>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="mb-3">"Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?"</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• Not at all</div>
                      <div>• Several days</div>
                      <div>• More than half the days</div>
                      <div>• Nearly every day</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="mb-3">"How would you rate your stress level over the past month?"</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• Very low • Low • Moderate • High • Very high</div>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <Badge variant="secondary">8 questions total • 10-15 minutes</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-12">
              <div>
                <h2 className="text-3xl text-center mb-12">What Our Users Say</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <h3 className="text-2xl mb-6">Trusted by Thousands</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl mb-2">10,000+</div>
                    <div className="text-muted-foreground">Assessments Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">500+</div>
                    <div className="text-muted-foreground">Professional Partners</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">4.8/5</div>
                    <div className="text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl text-center mb-12">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-primary/5 rounded-lg p-8">
            <h3 className="text-2xl mb-4">Ready to Start Your Mental Health Journey?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Take the first step towards better mental health with our free, confidential assessment. 
              No signup required to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onStartAssessment}>
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={onGetStarted}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}