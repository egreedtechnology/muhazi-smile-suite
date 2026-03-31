import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import SEOHead from "@/components/seo/SEOHead";
import BookingGuide from "@/components/booking/BookingGuide";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const services = [
  { id: "general", name: "General Checkup", duration: "30 min" },
  { id: "cleaning", name: "Teeth Cleaning", duration: "45 min" },
  { id: "filling", name: "Dental Filling", duration: "45 min" },
  { id: "whitening", name: "Teeth Whitening", duration: "60 min" },
  { id: "rootcanal", name: "Root Canal", duration: "90 min" },
  { id: "extraction", name: "Tooth Extraction", duration: "30 min" },
];

const doctors = [
  { id: "Evode", name: "Dr. Evode habineza", specialty: "Lead Dentist" },
  { id: "Jeanette", name: "Jeanette Uwamariya", specialty: "Assistant" },
  { id: "Samuel", name: "Dr. Samuel Niyonkuru", specialty: "BDS" },
];

const timeSlots = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00"
];

const BookAppointment = () => {
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ EMAIL FUNCTION (NEW FEATURE)
  const sendEmailNotification = async () => {
    try {
      await fetch("https://formspree.io/f/mzdkgvok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: "New Appointment - Muhazi Dental Clinic",
          name: patientInfo.name,
          email: patientInfo.email,
          phone: patientInfo.phone,
          service: services.find(s => s.id === selectedService)?.name,
          doctor: selectedDoctor
            ? doctors.find(d => d.id === selectedDoctor)?.name
            : "Any Available",
          date: selectedDate,
          time: selectedTime,
          message: patientInfo.notes || "No notes"
        })
      });
    } catch (error) {
      console.error("Email failed:", error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", patientInfo.phone)
        .maybeSingle();

      let patientId: string;

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error } = await supabase
          .from("patients")
          .insert({
            full_name: patientInfo.name,
            phone: patientInfo.phone,
            email: patientInfo.email || null,
          })
          .select("id")
          .single();

        if (error) throw error;
        patientId = newPatient.id;
      }

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          patient_id: patientId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          notes: patientInfo.notes,
          status: "pending",
          duration_minutes: 30,
        });

      if (appointmentError) throw appointmentError;

      // ✅ SEND EMAIL (ADDED FEATURE)
      await sendEmailNotification();

      toast({
        title: "Appointment Booked!",
        description: "Email notification sent successfully.",
      });

      setStep(5);
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedService;
    if (step === 3) return selectedDate && selectedTime;
    if (step === 4) return patientInfo.name && patientInfo.phone;
    return true;
  };

  return (
    <PublicLayout>
      <SEOHead title="Book Appointment | Muhazi Dental Clinic" />
      <BookingGuide />

      <section className="py-12 text-center">
        <h1 className="text-3xl font-bold">Book Appointment</h1>
      </section>

      <section className="max-w-xl mx-auto">

        {step === 1 && (
          <div>
            {services.map((s) => (
              <button key={s.id} onClick={() => setSelectedService(s.id)}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <Input
              placeholder="Name"
              value={patientInfo.name}
              onChange={(e) =>
                setPatientInfo({ ...patientInfo, name: e.target.value })
              }
            />
          </div>
        )}

        {step === 5 && (
          <div className="text-center">
            <CheckCircle2 />
            <h2>Success!</h2>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button onClick={() => setStep(step - 1)}>Back</Button>

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Confirm
            </Button>
          )}
        </div>

      </section>
    </PublicLayout>
  );
};

export default BookAppointment;