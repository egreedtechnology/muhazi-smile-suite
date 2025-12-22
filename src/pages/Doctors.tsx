import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award,
  GraduationCap,
  Calendar,
  ArrowRight
} from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const doctors = [
  {
    name: "Dr. Emmanuel Habimana",
    title: "Lead Dentist & Clinic Director",
    specialization: "General & Cosmetic Dentistry",
    experience: "12+ years experience",
    education: "University of Rwanda, School of Dentistry",
    bio: "Dr. Emmanuel is the founder and lead dentist at Muhazi Dental Clinic. His passion for dentistry and commitment to patient care has made the clinic a trusted name in Rwamagana.",
    avatar: "E",
  },
  {
    name: "Dr. Grace Uwimana",
    title: "Senior Dentist",
    specialization: "Endodontics & Root Canal",
    experience: "8+ years experience",
    education: "University of Rwanda, School of Dentistry",
    bio: "Dr. Grace specializes in root canal therapy and complex dental procedures. Her gentle approach puts even the most anxious patients at ease.",
    avatar: "G",
  },
  {
    name: "Dr. Patrick Nshimiyimana",
    title: "Dentist",
    specialization: "Oral Surgery & Implants",
    experience: "6+ years experience",
    education: "University of Rwanda, School of Dentistry",
    bio: "Dr. Patrick brings expertise in oral surgery and dental implants. He is committed to providing pain-free procedures and excellent outcomes.",
    avatar: "P",
  },
];

const Doctors = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-muted to-background">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mt-2 mb-6">
              Meet Our Dental Experts
            </h1>
            <p className="text-lg text-muted-foreground">
              Our team of experienced dental professionals is dedicated to providing 
              you with the highest quality care in a comfortable environment.
            </p>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <Card 
                key={index} 
                variant="elevated"
                className="overflow-hidden group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary-light to-muted flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full hero-gradient flex items-center justify-center text-5xl font-heading font-bold text-primary-foreground shadow-glow">
                    {doctor.avatar}
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl">{doctor.name}</h3>
                    <p className="text-primary font-medium">{doctor.title}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary shrink-0" />
                      <span>{doctor.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>{doctor.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                      <span>{doctor.education}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm">{doctor.bio}</p>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/book">
                      Book with {doctor.name.split(" ")[1]}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <Card variant="default" className="p-8 md:p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-heading font-bold mb-4">Join Our Team</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented dental professionals who share our 
              passion for patient care. If you're interested in joining our team, 
              we'd love to hear from you.
            </p>
            <Button variant="default" asChild>
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Meet Our Team?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Book an appointment today and experience the difference of personalized dental care.
          </p>
          <Button 
            size="lg" 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            asChild
          >
            <Link to="/book">
              <Calendar className="w-5 h-5" />
              Book Your Appointment
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Doctors;
