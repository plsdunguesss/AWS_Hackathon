import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Star, Filter, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Professional {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  location: string;
  phone: string;
  rating: number;
  reviewCount: number;
  acceptingPatients: boolean;
  insuranceAccepted: string[];
  bio: string;
  image?: string;
}

const mockProfessionals: Professional[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    title: "Licensed Clinical Psychologist",
    specialties: ["Anxiety", "Depression", "Trauma", "CBT"],
    location: "Downtown Medical Center, Suite 204",
    phone: "(555) 123-4567",
    rating: 4.8,
    reviewCount: 127,
    acceptingPatients: true,
    insuranceAccepted: ["Blue Cross", "Aetna", "United Healthcare"],
    bio: "Dr. Johnson specializes in evidence-based treatments for anxiety and depression with over 10 years of experience."
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    title: "Licensed Marriage & Family Therapist",
    specialties: ["Couples Therapy", "Family Counseling", "Communication"],
    location: "Wellness Center, 2nd Floor",
    phone: "(555) 234-5678",
    rating: 4.9,
    reviewCount: 89,
    acceptingPatients: true,
    insuranceAccepted: ["Cigna", "Blue Cross", "Medicare"],
    bio: "Specializing in relationship counseling and family dynamics with a focus on communication and healing."
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    title: "Licensed Clinical Social Worker",
    specialties: ["Stress Management", "Work-Life Balance", "Mindfulness"],
    location: "Community Health Building",
    phone: "(555) 345-6789",
    rating: 4.7,
    reviewCount: 156,
    acceptingPatients: false,
    insuranceAccepted: ["Blue Cross", "Aetna"],
    bio: "Focuses on stress management and helping professionals achieve better work-life balance through mindfulness techniques."
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    title: "Psychiatrist",
    specialties: ["Medication Management", "Bipolar Disorder", "ADHD"],
    location: "Medical Plaza, Suite 305",
    phone: "(555) 456-7890",
    rating: 4.6,
    reviewCount: 203,
    acceptingPatients: true,
    insuranceAccepted: ["United Healthcare", "Cigna", "Medicare"],
    bio: "Board-certified psychiatrist specializing in medication management and treatment of mood disorders."
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    title: "Licensed Professional Counselor",
    specialties: ["Teen Counseling", "Young Adults", "Identity Issues"],
    location: "Youth Services Center",
    phone: "(555) 567-8901",
    rating: 4.9,
    reviewCount: 94,
    acceptingPatients: true,
    insuranceAccepted: ["Blue Cross", "Aetna", "United Healthcare"],
    bio: "Specializes in working with teenagers and young adults navigating life transitions and identity development."
  }
];

interface ProfessionalDirectoryProps {
  onBack: () => void;
}

export function ProfessionalDirectory({ onBack }: ProfessionalDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const allSpecialties = Array.from(
    new Set(mockProfessionals.flatMap(p => p.specialties))
  ).sort();

  const filteredProfessionals = mockProfessionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = !selectedSpecialty || professional.specialties.includes(selectedSpecialty);
    const matchesAvailability = !showAvailableOnly || professional.acceptingPatients;

    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl mb-2">Mental Health Professionals</h1>
          <p className="text-muted-foreground">
            Connect with qualified mental health professionals in your area. All providers are licensed and verified.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, title, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {allSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant={showAvailableOnly ? "default" : "outline"}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className="whitespace-nowrap"
            >
              <Filter className="mr-2 h-4 w-4" />
              Available Only
            </Button>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProfessionals.length} of {mockProfessionals.length} professionals
          </p>
        </div>

        {/* Professional Cards */}
        <div className="grid gap-6">
          {filteredProfessionals.map(professional => (
            <Card key={professional.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl mb-1">{professional.name}</h3>
                      <p className="text-muted-foreground mb-2">{professional.title}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{professional.rating}</span>
                          <span className="ml-1 text-sm text-muted-foreground">
                            ({professional.reviewCount} reviews)
                          </span>
                        </div>
                        <Badge 
                          variant={professional.acceptingPatients ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {professional.acceptingPatients ? "Accepting Patients" : "Waitlist Available"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {professional.specialties.map(specialty => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {professional.bio}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{professional.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Insurance Accepted:</p>
                    <div className="flex flex-wrap gap-1">
                      {professional.insuranceAccepted.map(insurance => (
                        <Badge key={insurance} variant="secondary" className="text-xs">
                          {insurance}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-48">
                  <Button 
                    className="w-full"
                    disabled={!professional.acceptingPatients}
                  >
                    {professional.acceptingPatients ? "Book Appointment" : "Join Waitlist"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Send Message
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProfessionals.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No professionals found matching your criteria. Try adjusting your search or filters.
            </p>
          </Card>
        )}

        {/* Emergency Resources */}
        <Card className="p-6 mt-8 border-red-200 bg-red-50">
          <h3 className="text-red-800 mb-4">Crisis Resources</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-red-700 mb-2">
                <strong>National Suicide Prevention Lifeline</strong>
              </p>
              <p className="text-red-600">Call: 988 (24/7)</p>
            </div>
            <div>
              <p className="text-red-700 mb-2">
                <strong>Crisis Text Line</strong>
              </p>
              <p className="text-red-600">Text HOME to 741741</p>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-4">
            If you're experiencing a mental health emergency, please contact emergency services (911) or go to your nearest emergency room.
          </p>
        </Card>
      </div>
    </div>
  );
}