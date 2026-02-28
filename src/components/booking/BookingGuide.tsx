import { useState, useEffect } from "react";
import { X, ArrowRight, Lightbulb, Calendar, User, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUIDE_STORAGE_KEY = "mdc_booking_guide_seen";

const steps = [
  {
    icon: Lightbulb,
    title: "Welcome to Online Booking!",
    description: "Book your dental appointment in 4 easy steps. We'll guide you through the process.",
  },
  {
    icon: Calendar,
    title: "Step 1: Choose a Service",
    description: "Select the dental service you need — from checkups to whitening and more.",
  },
  {
    icon: User,
    title: "Step 2: Pick a Doctor",
    description: "Choose your preferred dentist, or let us assign the next available one.",
  },
  {
    icon: Clock,
    title: "Step 3: Select Date & Time",
    description: "Pick a convenient date and available time slot for your visit.",
  },
  {
    icon: FileText,
    title: "Step 4: Confirm Details",
    description: "Enter your name and phone number, then confirm your booking. That's it!",
  },
];

const BookingGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(GUIDE_STORAGE_KEY);
    if (!seen) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(GUIDE_STORAGE_KEY, "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Guide Card */}
      <div className="relative bg-card rounded-2xl shadow-xl border border-border max-w-md w-full p-6 animate-scale-in">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl hero-gradient flex items-center justify-center">
          <StepIcon className="w-8 h-8 text-primary-foreground" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-heading font-bold text-center mb-2">{step.title}</h3>
        <p className="text-muted-foreground text-center mb-6">{step.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-2 bg-primary/50" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Skip
          </Button>
          <Button variant="hero" className="flex-1" onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Start Booking"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingGuide;
