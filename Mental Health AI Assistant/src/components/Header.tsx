import { Brain, Menu } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onNavigate?: (view: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">MindCare AI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => onNavigate?.('home')} 
            className="text-sm hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate?.('assessment')} 
            className="text-sm hover:text-primary transition-colors"
          >
            Assessment
          </button>
          <button 
            onClick={() => onNavigate?.('resources')} 
            className="text-sm hover:text-primary transition-colors"
          >
            Resources
          </button>
          <button 
            onClick={() => onNavigate?.('findhelp')} 
            className="text-sm hover:text-primary transition-colors"
          >
            Find Help
          </button>
          {/* Temporary navigation for testing new pages */}
          <button 
            onClick={() => onNavigate?.('dashboard')} 
            className="text-sm hover:text-primary transition-colors text-blue-600"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate?.('chat')} 
            className="text-sm hover:text-primary transition-colors text-green-600"
          >
            AI Chat
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="hidden sm:inline-flex"
            onClick={() => onNavigate?.('signin')}
          >
            Sign In
          </Button>
          <Button 
            className="hidden sm:inline-flex"
            onClick={() => onNavigate?.('getstarted')}
          >
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}