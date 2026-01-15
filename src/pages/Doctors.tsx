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
import SEOHead from "@/components/seo/SEOHead";

const doctors = [
  {
    name: "Dr. Evode habineza",
    title: "Lead Dentist & Clinic Director",
    specialization: "General & Cosmetic Dentistry",
    experience: "12+ years experience",
    education: "University of Rwanda, School of Dentistry",
    bio: "Dr. Evode is the Chief Executive Officer of Muhazi Dental Clinic, where he leads the clinic’s strategic vision, operations, and growth. With a strong commitment to excellence in healthcare delivery, he ensures that the clinic maintains the highest standards of professionalism, innovation, and patient-centered care. Under his leadership, Muhazi Dental Clinic continues to grow as a trusted dental care provider in Rwamagana and beyond.",
    avatar: "https://lh3.googleusercontent.com/p/AF1QipOGWgjftoZ3Zn6w-ihX1zC1P-Jh8C89dZ3sYNh7=s680-w680-h510-rw",
  },
  {

  name: "Jeanette Uwamariya",
  title: "Dental Assistant",
  specialization: "Endodontics & Root Canal Support",
  experience: "8+ years of professional experience",
  education: "University of Rwanda – School of Dentistry",
  bio: "Jeanette Uwamariya is a skilled Dental Assistant with extensive experience in endodontic and root canal procedures. She plays a vital role in supporting clinical operations and ensuring patient comfort throughout treatment. Known for her professionalism, precision, and compassionate approach, Jeanette helps create a calm and reassuring environment for patients while maintaining high standards of clinical care.",
  avatar: "J",


  },
  {
    
  name: "Dr. Samuel Niyonkuru",
  title: "BDS",
  specialization: "Oral Surgery & Dental Implants",
  experience: "6+ years of clinical experience",
  education: "University of Rwanda – School of Dentistry",
  bio: "Dr. Samuel Niyonkuru is a qualified dental surgeon with specialized expertise in oral surgery and dental implant procedures. He is dedicated to delivering safe, precise, and pain-free treatments while achieving excellent clinical outcomes. Known for his professionalism and patient-focused care, Dr. Samuel is committed to restoring oral function and confidence through advanced surgical dentistry.",
  profilePicture: "data:image/jpeg;base64,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",

  },
];

const Doctors = () => {
  return (
    <PublicLayout>
      <SEOHead 
        title="Our Dentists | Muhazi Dental Clinic"
        description="Meet our experienced dental professionals at Muhazi Dental Clinic in Rwamagana, Rwanda. Expert care from qualified dentists."
        canonical="/doctors"
        keywords="dentist Rwamagana, dental experts Rwanda, Dr. Evode habineza, dental team, Muhazi Dental"
      />
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
