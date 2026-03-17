import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Stethoscope, Heart, Pill, Shield, Users, 
  Smile, Utensils, HelpCircle, X, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Service definitions
const PRIMARY_HEALTH_SERVICES = [
  {
    id: "medical-consultations",
    title: "Medical Consultations",
    description: "Visit a doctor for check-ups, symptoms, and treatment",
    icon: Stethoscope,
    fullDescription: "Get a proper diagnosis and treatment plan from a licensed physician at your nearest health center.",
    whoShouldAvail: "Anyone experiencing illness, pain, or needing a routine health check-up.",
    schedule: "Monday to Friday, 8:00 AM – 5:00 PM",
    locations: [
      {
        name: "Barangay Health Center 1",
        address: "123 Rizal St., San Jose",
        schedule: "Mon–Fri, 8AM–5PM",
      },
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Mon–Sat, 7AM–6PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Get a proper diagnosis and treatment plan from a licensed physician at your nearest health center.",
      },
      {
        title: "Who Should Avail",
        content:
          "Anyone experiencing illness, pain, or needing a routine health check-up.",
      },
      {
        title: "What to bring",
        items: [
          "Valid ID",
          "PhilHealth ID (if available)",
          "Previous medical records or prescriptions (if any)",
        ],
      },
    ],
    action: "Request Appointment",
  },
  {
    id: "laboratory-tests",
    title: "Laboratory Tests",
    description: "Blood tests, urinalysis, and other diagnostic exams",
    icon: Pill,
    fullDescription: "Accurate lab results help doctors give you the right diagnosis and treatment.",
    whoShouldAvail: "Patients referred by a doctor or those requiring routine blood and urine tests.",
    schedule: "Tuesday and Thursday, 7:00 AM – 12:00 PM",
    locations: [
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Tue & Thu, 7AM–12PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Accurate lab results help doctors give you the right diagnosis and treatment.",
      },
      {
        title: "Who Should Avail",
        content:
          "Patients referred by a doctor or those requiring routine blood and urine tests.",
      },
      {
        title: "What to bring",
        items: [
          "Valid ID",
          "Doctor's request form (if available)",
          "Any current medications or treatment notes",
        ],
      },
    ],
    action: "Request Appointment",
  },
  {
    id: "dental-services",
    title: "Dental Services",
    description: "Free tooth extraction, cleaning, and oral health check",
    icon: Smile,
    fullDescription: "Maintain good oral health with free dental consultations and basic procedures.",
    whoShouldAvail: "All residents, especially children and senior citizens.",
    schedule: "Wednesday and Friday, 9:00 AM – 3:00 PM",
    locations: [
      {
        name: "Barangay Health Center 2",
        address: "78 Aguinaldo Rd., Poblacion",
        schedule: "Wed & Fri, 9AM–3PM",
      },
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Mon–Fri, 8AM–4PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Maintain good oral health with free dental consultations and basic procedures.",
      },
      {
        title: "Who Should Avail",
        content:
          "All residents, especially children and senior citizens.",
      },
      {
        title: "What to bring",
        items: [
          "Valid ID",
          "Any existing dental records (if available)",
        ],
      },
    ],
    action: "Request Appointment",
  },
];

const PREVENTIVE_PROGRAMS = [
  {
    id: "family-planning",
    title: "Family Planning",
    description: "Free counseling and contraceptive services for family planning",
    icon: Users,
    fullDescription: "Helps families plan the number and spacing of their children for better health and quality of life.",
    whoShouldAvail: "Married couples, women of reproductive age, and anyone seeking family planning advice.",
    schedule: "Every Monday, 8:00 AM – 4:00 PM",
    locations: [
      {
        name: "Barangay Health Center 1",
        address: "123 Rizal St., San Jose",
        schedule: "Mon, 8AM–4PM",
      },
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Mon–Fri, 8AM–5PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Helps families plan the number and spacing of their children for better health and quality of life.",
      },
      {
        title: "Who Should Avail",
        content:
          "Married couples, women of reproductive age, and anyone seeking family planning advice.",
      },
      {
        title: "Schedule",
        content: "Every Monday, 8:00 AM – 4:00 PM",
      },
      {
        title: "Available At",
        items: [
          "Barangay Health Center 1 — 123 Rizal St., San Jose — Mon, 8AM–4PM",
          "City Health Office Main — 456 Mabini Ave., Downtown — Mon–Fri, 8AM–5PM",
        ],
      },
    ],
    action: "Join Program",
  },
  {
    id: "cancer-screening",
    title: "Cancer Screening",
    description: "Free screening for breast cancer and colon cancer",
    icon: Shield,
    fullDescription: "Early detection of cancer greatly increases chances of successful treatment and recovery.",
    whoShouldAvail: "Women aged 25 and above; men aged 40 and above for colon screening.",
    schedule: "Every 2nd and 4th Friday of the month",
    locations: [
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "2nd & 4th Friday, 8AM–3PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Early detection of cancer greatly increases chances of successful treatment and recovery.",
      },
      {
        title: "Who Should Avail",
        content:
          "Women aged 25 and above; men aged 40 and above for colon screening.",
      },
      {
        title: "Schedule",
        content: "Every 2nd and 4th Friday of the month",
      },
      {
        title: "Available At",
        items: [
          "City Health Office Main — 456 Mabini Ave., Downtown — 2nd & 4th Friday, 8AM–3PM",
        ],
      },
    ],
    action: "Join Program",
  },
  {
    id: "tb-screening",
    title: "TB Screening",
    description: "Free tuberculosis screening and treatment support",
    icon: Heart,
    fullDescription: "Detect and treat tuberculosis early to protect you and your family from infection.",
    whoShouldAvail: "Anyone with persistent cough for 2 weeks or more, or who has been in close contact with a TB patient.",
    schedule: "Walk-in accepted Monday to Friday, 8AM–4PM",
    locations: [
      {
        name: "Barangay Health Center 1",
        address: "123 Rizal St., San Jose",
        schedule: "Mon–Fri, 8AM–4PM",
      },
      {
        name: "Barangay Health Center 2",
        address: "78 Aguinaldo Rd., Poblacion",
        schedule: "Mon–Fri, 8AM–4PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Detect and treat tuberculosis early to protect you and your family from infection.",
      },
      {
        title: "Who Should Avail",
        content:
          "Anyone with persistent cough for 2 weeks or more, or who has been in close contact with a TB patient.",
      },
      {
        title: "Schedule",
        content: "Walk-in accepted Monday to Friday, 8AM–4PM",
      },
      {
        title: "Available At",
        items: [
          "Barangay Health Center 1 — 123 Rizal St., San Jose — Mon–Fri, 8AM–4PM",
          "Barangay Health Center 2 — 78 Aguinaldo Rd., Poblacion — Mon–Fri, 8AM–4PM",
        ],
      },
    ],
    action: "Join Program",
  },
  {
    id: "hiv-testing",
    title: "HIV Testing",
    description: "Free, confidential HIV testing and counseling",
    icon: Shield,
    fullDescription: "Know your status and get the right support early. All results are strictly confidential.",
    whoShouldAvail: "Anyone who wants to know their HIV status. Testing is completely voluntary and confidential.",
    schedule: "By appointment only. Call 0917-XXX-XXXX.",
    locations: [
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "By appointment only",
      },
    ],
    modalSections: [
      {
        title: "Strictly Confidential",
        content:
          "Your privacy is protected. All information shared during this service is strictly confidential and will not be disclosed to anyone without your consent.",
      },
      {
        title: "About This Service",
        content:
          "Know your status and get the right support early. All results are strictly confidential.",
      },
      {
        title: "Who Should Avail",
        content:
          "Anyone who wants to know their HIV status. Testing is completely voluntary and confidential.",
      },
      {
        title: "Schedule",
        content: "By appointment only. Call 0917-XXX-XXXX.",
      },
      {
        title: "Available At",
        items: [
          "City Health Office Main — 456 Mabini Ave., Downtown — By appointment only",
        ],
      },
    ],
    action: "Schedule Testing",
    private: true,
  },
];

const SPECIALIZED_SERVICES = [
  {
    id: "mental-health-support",
    title: "Mental Health Support",
    description: "Talk to a counselor about stress, anxiety, or mental health",
    icon: Heart,
    fullDescription: "Professional and compassionate support for your mental and emotional well-being.",
    whoShouldAvail: "Anyone experiencing stress, anxiety, depression, or emotional difficulties.",
    schedule: "Wednesday and Friday, 9:00 AM – 4:00 PM. Walk-ins welcome.",
    locations: [
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Wed & Fri, 9AM–4PM",
      },
    ],
    modalSections: [
      {
        title: "Strictly Confidential",
        content:
          "Your privacy is protected. All information shared during this service is strictly confidential and will not be disclosed to anyone without your consent.",
      },
      {
        title: "About This Service",
        content:
          "Professional and compassionate support for your mental and emotional well-being.",
      },
      {
        title: "Who Should Avail",
        content:
          "Anyone experiencing stress, anxiety, depression, or emotional difficulties.",
      },
      {
        title: "Schedule",
        content: "Wednesday and Friday, 9:00 AM – 4:00 PM. Walk-ins welcome.",
      },
      {
        title: "Available At",
        items: [
          "City Health Office Main — 456 Mabini Ave., Downtown — Wed & Fri, 9AM–4PM",
        ],
      },
    ],
    action: "Request Appointment",
    private: true,
  },
  {
    id: "gender-services",
    title: "Gender-Inclusive Services",
    description: "Safe, respectful health services for all gender identities",
    icon: Users,
    fullDescription: "Inclusive health care that respects everyone's identity and dignity.",
    whoShouldAvail: "All individuals regardless of gender identity or expression.",
    schedule: "Thursday, 1:00 PM – 5:00 PM. By appointment preferred.",
    locations: [
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Thu, 1PM–5PM",
      },
    ],
    modalSections: [
      {
        title: "Strictly Confidential",
        content:
          "Your privacy is protected. All information shared during this service is strictly confidential and will not be disclosed to anyone without your consent.",
      },
      {
        title: "About This Service",
        content:
          "Inclusive health care that respects everyone's identity and dignity.",
      },
      {
        title: "Who Should Avail",
        content:
          "All individuals regardless of gender identity or expression.",
      },
      {
        title: "Schedule",
        content: "Thursday, 1:00 PM – 5:00 PM. By appointment preferred.",
      },
      {
        title: "Available At",
        items: [
          "City Health Office Main — 456 Mabini Ave., Downtown — Thu, 1PM–5PM",
        ],
      },
    ],
    action: "Request Appointment",
    private: true,
  },
  {
    id: "nutrition-counseling",
    title: "Nutrition Counseling",
    description: "Get personalized diet advice from a registered nutritionist",
    icon: Utensils,
    fullDescription: "Improve your health through proper nutrition guidance tailored to your lifestyle.",
    whoShouldAvail: "Individuals with malnutrition, obesity, diabetes, or anyone wanting to eat healthier.",
    schedule: "Tuesday and Thursday, 8:00 AM – 12:00 PM",
    locations: [
      {
        name: "Barangay Health Center 1",
        address: "123 Rizal St., San Jose",
        schedule: "Tue & Thu, 8AM–12PM",
      },
      {
        name: "City Health Office Main",
        address: "456 Mabini Ave., Downtown",
        schedule: "Mon–Fri, 8AM–12PM",
      },
    ],
    modalSections: [
      {
        title: "About This Service",
        content:
          "Improve your health through proper nutrition guidance tailored to your lifestyle.",
      },
      {
        title: "Who Should Avail",
        content:
          "Individuals with malnutrition, obesity, diabetes, or anyone wanting to eat healthier.",
      },
      {
        title: "Schedule",
        content: "Tuesday and Thursday, 8:00 AM – 12:00 PM",
      },
      {
        title: "Available At",
        items: [
          "Barangay Health Center 1 — 123 Rizal St., San Jose — Tue & Thu, 8AM–12PM",
          "City Health Office Main — 456 Mabini Ave., Downtown — Mon–Fri, 8AM–12PM",
        ],
      },
    ],
    action: "Request Appointment",
  },
];

const SENIOR_PWD_BENEFITS = [
  {
    id: "free-medicines",
    title: "Free Maintenance Medicines",
    description: "Senior citizens and PWDs can receive free maintenance medicines.",
    fullDescription:
      "Receive prescription maintenance medicines free of charge at participating health centers. This helps ensure continued treatment for chronic conditions.",
    icon: Pill,
    requirements: ["Valid Senior Citizen ID or PWD ID", "Doctor's prescription", "Barangay certificate of residency"],
    claimLocation: "Barangay Health Center or City Health Office Pharmacy Window"
  },
  {
    id: "priority-lanes",
    title: "Priority Consultation Lanes",
    description: "Senior citizens and PWDs are given priority access in all health consultations.",
    fullDescription:
      "Skip the regular queue and receive faster service at the health center. Show your valid ID at registration to access priority lanes.",
    icon: AlertCircle,
    requirements: ["Valid Senior Citizen ID or PWD ID"],
    claimLocation: "All health centers - present ID at registration"
  },
  {
    id: "philhealth-assistance",
    title: "PhilHealth Assistance",
    description: "Get assistance with PhilHealth enrollment, claims, and benefits.",
    fullDescription:
      "Our staff can help you register for PhilHealth, file claims, and understand your benefits so you get the coverage you are entitled to.",
    icon: Shield,
    requirements: ["Valid ID", "PhilHealth number (if any)"],
    claimLocation: "City Health Office - PhilHealth Counter"
  },
];

interface ServiceDetailModalProps {
  service: any;
  onClose: () => void;
  onRequest: (service: any) => void;
  category: string;
}

const ServiceDetailModal = ({ service, onClose, onRequest, category }: ServiceDetailModalProps) => {
  const IconComponent = service.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <DialogHeader className="sticky top-0 bg-card border-b p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold">{service.title}</DialogTitle>
              {service.private && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  🔒 Strictly Confidential
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <CardContent className="space-y-6 p-6">
          {/* Modal Sections (if provided) */}
          {service.modalSections ? (
            <div className="space-y-6">
              {service.modalSections.map((section: any, idx: number) => (
                <div key={idx}>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {section.title}
                  </h3>
                  {section.content && (
                    <p className="text-sm text-muted-foreground">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {section.items.map((item: string, itemIdx: number) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* About Service */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  About This Service
                </h3>
                <p className="text-sm text-muted-foreground">{service.fullDescription}</p>
              </div>

              {/* Who Should Avail */}
              {service.whoShouldAvail && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Who Should Avail
                  </h3>
                  <p className="text-sm text-muted-foreground">{service.whoShouldAvail}</p>
                </div>
              )}

              {/* Schedule */}
              {service.schedule && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">📅 Schedule</h3>
                  <p className="text-sm">{service.schedule}</p>
                </div>
              )}

            </>
          )}

          {/* Available At (always shown when locations exist) */}
          {service.locations && (
            <div>
              <h3 className="font-semibold text-sm mb-2">📍 Available At</h3>
              <div className="space-y-3">
                {service.locations.map((location: any, idx: number) => (
                  <div key={idx} className="text-sm p-3 bg-muted rounded">
                    <p className="font-semibold">{location.name}</p>
                    {location.address && (
                      <p className="text-muted-foreground">{location.address}</p>
                    )}
                    {location.schedule && (
                      <p className="text-xs text-muted-foreground mt-1">{location.schedule}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => onRequest(service)}
            className="w-full h-14 text-base font-semibold"
          >
            {service.action || "Request Service"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

interface PWDServiceDetailModalProps {
  service: any;
  onClose: () => void;
  onRequest: (service: any) => void;
}

const PWDServiceDetailModal = ({ service, onClose, onRequest }: PWDServiceDetailModalProps) => {
  const IconComponent = service.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full">
        <DialogHeader className="sticky top-0 bg-card border-b p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <IconComponent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-xl">{service.title}</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="font-semibold text-base mb-2">What is this benefit?</h3>
            <p className="text-sm text-muted-foreground">
              {service.fullDescription || service.description}
            </p>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              📋 Required Documents
            </h3>
            <ul className="space-y-2">
              {service.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Where to Claim */}
          <div>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              📍 Where to Claim
            </h3>
            <p className="text-sm p-3 bg-muted rounded">{service.claimLocation}</p>
          </div>

          <Button 
            onClick={() => onRequest(service)}
            className="w-full h-14 text-base font-semibold"
          >
            Request Assistance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

interface ServiceCardProps {
  service: any;
  onClick: () => void;
}

const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  const IconComponent = service.icon;

  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50 h-full"
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
            <p className="text-xs text-muted-foreground">{service.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PWDCardProps {
  service: any;
  onClick: () => void;
}

const PWDCard = ({ service, onClick }: PWDCardProps) => {
  const IconComponent = service.icon;

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 h-full bg-orange-50 dark:bg-orange-950/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg flex-shrink-0">
            <IconComponent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
            <p className="text-xs text-muted-foreground">{service.description}</p>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
          <p className="text-sm font-semibold mb-2">Required Documents</p>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            {service.requirements?.map((req: string, idx: number) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>

          <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900 rounded">
            <p className="text-sm font-semibold">Where to Claim</p>
            <p className="text-sm text-muted-foreground">{service.claimLocation}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 font-semibold"
          onClick={onClick}
        >
          Request Assistance
        </Button>
      </CardContent>
    </Card>
  );
};

const CATEGORY_OPTIONS = [
  { id: null, label: "All Services" },
  { id: "primary", label: "Primary Health" },
  { id: "preventive", label: "Preventive" },
  { id: "specialized", label: "Specialized" },
  { id: "senior", label: "Senior & PWD" },
];

const HealthServicesHub = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestingService, setRequestingService] = useState<any>(null);
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const queryClient = useQueryClient();

  const requestMutation = useMutation({
    mutationFn: async (service: any) => {
      const { error } = await supabase.from("service_requests").insert({
        user_id: user!.id,
        request_type: "Health Service",
        title: `Request for ${service.title}`,
        description: `Citizen requested: ${service.title}`,
        status: "Pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen_service_requests", user?.id] });
      setSelectedService(null);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);

      if (requestingService?.category === "senior" || requestingService?.isPWD) {
        setShowAssistanceModal(true);
      }

      toast.success("Request submitted successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleRequestService = (service: any) => {
    setRequestingService(service);
    requestMutation.mutate(service);
  };

  // Filter services based on search and category
  const filterServices = (services: any[]) =>
    services.filter((s) =>
      (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const filteredPrimary = filterServices(PRIMARY_HEALTH_SERVICES);
  const filteredPreventive = filterServices(PREVENTIVE_PROGRAMS);
  const filteredSpecialized = filterServices(SPECIALIZED_SERVICES);
  const filteredSenior = filterServices(SENIOR_PWD_BENEFITS);

  const visiblePrimary = activeCategory === null || activeCategory === "primary" ? filteredPrimary : [];
  const visiblePreventive = activeCategory === null || activeCategory === "preventive" ? filteredPreventive : [];
  const visibleSpecialized = activeCategory === null || activeCategory === "specialized" ? filteredSpecialized : [];
  const visibleSenior = activeCategory === null || activeCategory === "senior" ? filteredSenior : [];

  const hasResults =
    visiblePrimary.length > 0 ||
    visiblePreventive.length > 0 ||
    visibleSpecialized.length > 0 ||
    visibleSenior.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold font-heading">Health Services</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore services, programs, and benefits available at your local health center.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => setShowHelpModal(true)}
              className="gap-2 h-12"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Guide Me</span>
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services (e.g., dental, TB, nutrition...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <Button
                  key={category.id ?? "all"}
                  variant={activeCategory === category.id ? "secondary" : "outline"}
                  size="sm"
                  className="h-10 px-4"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        {showConfirmation && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">Request Submitted!</p>
              <p className="text-sm text-green-700 dark:text-green-200">
                We've received your request. Check your service requests for updates.
              </p>
            </div>
          </div>
        )}

        {hasResults ? (
          <>
            {/* PRIMARY HEALTH SERVICES */}
            {visiblePrimary.length > 0 && (
              <section className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                    Primary Health Services
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Basic health services available at your local health center
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visiblePrimary.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => setSelectedService({ ...service, category: "primary" })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PREVENTIVE PROGRAMS */}
            {visiblePreventive.length > 0 && (
              <section className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
                    <Shield className="h-6 w-6 text-teal-600" />
                    Preventive Programs
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Programs to help prevent diseases and maintain good health
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visiblePreventive.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => setSelectedService({ ...service, category: "preventive" })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SPECIALIZED SERVICES */}
            {visibleSpecialized.length > 0 && (
              <section className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
                    <Heart className="h-6 w-6 text-purple-600" />
                    Specialized Services
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Additional support services for specific health needs
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleSpecialized.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onClick={() => setSelectedService({ ...service, category: "specialized" })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SENIOR & PWD BENEFITS */}
            {filteredSenior.length > 0 && (
              <section className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg md:text-xl font-bold font-heading flex items-center gap-2">
                    <Users className="h-7 w-7 text-orange-600" />
                    Senior Citizen & PWD Benefits
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Exclusive benefits for senior citizens and persons with disabilities
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSenior.map(service => (
                    <PWDCard
                      key={service.id}
                      service={service}
                      onClick={() => setSelectedService({ ...service, category: "senior", isPWD: true })}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground">No services found matching "{searchQuery}"</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Services Detail Modal */}
        {selectedService && !selectedService.isPWD && (
          <ServiceDetailModal
            service={selectedService}
            category={selectedService.category}
            onClose={() => setSelectedService(null)}
            onRequest={handleRequestService}
          />
        )}

        {selectedService && selectedService.isPWD && (
          <PWDServiceDetailModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
            onRequest={handleRequestService}
          />
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
                <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  How To Use This Page
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowHelpModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <CardContent className="space-y-4 p-6">
                <p className="text-sm font-medium text-muted-foreground">Simple guide for first-time users</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold">Find Your Service</p>
                      <p className="text-xs text-muted-foreground">Use the search bar or tap on a category button to find the health service you need.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold">Tap on the Service</p>
                      <p className="text-xs text-muted-foreground">Tap or click on the service card to view more details, available locations, and schedules.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold">Request an Appointment</p>
                      <p className="text-xs text-muted-foreground">Tap the button at the bottom of the service page to request an appointment or join a program.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">4</div>
                    <div>
                      <p className="font-semibold">Wait for Confirmation</p>
                      <p className="text-xs text-muted-foreground">Your request will be recorded. You will receive confirmation about your appointment schedule.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">5</div>
                    <div>
                      <p className="font-semibold">Visit the Health Center</p>
                      <p className="text-xs text-muted-foreground">Go to the health center on the scheduled time. Bring a valid ID and any required documents.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    Need more help? Visit any health center and ask a staff member to assist you with using this system. We are happy to help!
                  </p>
                </div>
              </CardContent>
              <div className="p-6 border-t">
                <Button onClick={() => setShowHelpModal(false)} className="w-full">
                  Got It, Thanks!
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Assistance Confirmation Modal */}
        {showAssistanceModal && requestingService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <DialogHeader className="p-6 border-b flex flex-row items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Assistance Request Submitted
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAssistanceModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-semibold">{requestingService.title}</p>
                <p className="text-sm text-muted-foreground">
                  Your request for assistance has been recorded. Please visit the health center with the required documents to complete the process.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">What to do next:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Wait for a confirmation message or call</li>
                    <li>Prepare a valid ID before visiting</li>
                    <li>Arrive 10–15 minutes before your schedule</li>
                  </ul>
                </div>
              </CardContent>
              <div className="p-6 border-t">
                <Button onClick={() => setShowAssistanceModal(false)} className="w-full">
                  Done
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthServicesHub;
