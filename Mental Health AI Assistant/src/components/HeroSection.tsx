import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface HeroSectionProps {
  onStartAssessment: () => void;
  onLearnMore?: () => void;
}

export function HeroSection({ onStartAssessment, onLearnMore }: HeroSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl mb-6 max-w-4xl mx-auto">
            Your Mental Health Journey Starts Here
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get preliminary mental health insights through our AI-powered assessment. 
            Receive personalized recommendations and connect with qualified professionals when needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onStartAssessment}
              className="text-lg px-8 py-6"
            >
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={onLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2">Quick Assessment</h3>
            <p className="text-muted-foreground">
              Complete a comprehensive mental health screening in just 10-15 minutes
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2">Confidential & Secure</h3>
            <p className="text-muted-foreground">
              Your privacy is our priority. All responses are encrypted and secure
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2">Professional Network</h3>
            <p className="text-muted-foreground">
              Connect with licensed therapists and counselors in your area
            </p>
          </Card>
        </div>

        <div className="mt-16 p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Important:</strong> This tool provides preliminary insights only and is not a substitute for professional medical advice, 
            diagnosis, or treatment. Always seek the advice of qualified mental health professionals with any questions you may have.
          </p>
        </div>
      </div>
    </section>
  );
}