import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Calendar, 
  Shield, 
  Heart, 
  Smile, 
  Clock, 
  Award, 
  Users, 
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import heroDental from "@/assets/hero-dental.jpg";

const services = [
  {
    icon: Smile,
    title: "General Dentistry",
    description: "Complete dental checkups, cleanings, and preventive care for the whole family.",
  },
  {
    icon: Sparkles,
    title: "Teeth Whitening",
    description: "Professional whitening treatments for a brighter, more confident smile.",
  },
  {
    icon: Shield,
    title: "Dental Fillings",
    description: "High-quality tooth-colored fillings to restore damaged teeth naturally.",
  },
  {
    icon: Heart,
    title: "Root Canal",
    description: "Painless root canal therapy to save infected teeth and relieve pain.",
  },
];

const stats = [
  { value: "5000+", label: "Happy Patients" },
  { value: "10+", label: "Years Experience" },
  { value: "15+", label: "Dental Services" },
  { value: "98%", label: "Success Rate" },
];

const testimonials = [
  {
    name: "Jean Pierre M.",
    text: "Excellent service! The staff is very professional and the clinic is clean and modern. I highly recommend Muhazi Dental Clinic.",
    rating: 5,
  },
  {
    name: "Grace U.",
    text: "I was nervous about my root canal but Dr. Emmanuel made me feel comfortable throughout the procedure. Thank you!",
    rating: 5,
  },
  {
    name: "Patrick K.",
    text: "Best dental clinic in Rwamagana. Fair prices and quality treatment. My whole family comes here.",
    rating: 5,
  },
];

const Index = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroDental} 
            alt="Modern dental clinic interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container-custom px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm mb-6 animate-fade-in">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted Dental Care in Rwanda</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
              Your Smile is Our
              <span className="block text-primary">Priority</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl animate-slide-up animation-delay-100">
              Experience world-class dental care at Muhazi Dental Clinic. Our expert team provides 
              comprehensive dental services in a comfortable, modern environment.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-200">
              <Button variant="hero" size="xl" asChild>
                <Link to="/book">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <a href="tel:+250787630399">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 animate-slide-up animation-delay-300">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl border border-primary-foreground/20">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-4">
              Comprehensive Dental Care
            </h2>
            <p className="text-muted-foreground">
              We offer a full range of dental services to keep your smile healthy and beautiful.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={index} 
                variant="interactive"
                className={`group animate-fade-in animation-delay-${index * 100}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl hero-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/services">
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-6">
                Quality Dental Care You Can Trust
              </h2>
              <p className="text-muted-foreground mb-8">
                At Muhazi Dental Clinic, we combine expertise with compassion to deliver exceptional 
                dental care. Our state-of-the-art facility and experienced team ensure you receive 
                the best treatment possible.
              </p>

              <div className="space-y-4">
                {[
                  "Modern equipment and sterilization protocols",
                  "Experienced and caring dental professionals",
                  "Comfortable and relaxing environment",
                  "Affordable pricing with payment options",
                  "Convenient location in Rwamagana",
                  "Open 7 days a week, 8 AM - 8 PM",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button variant="default" size="lg" className="mt-8" asChild>
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card variant="elevated" className="p-6 text-center">
                <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-1">Certified</h3>
                <p className="text-sm text-muted-foreground">Licensed professionals</p>
              </Card>
              <Card variant="elevated" className="p-6 text-center mt-8">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-1">Flexible Hours</h3>
                <p className="text-sm text-muted-foreground">Open 7 days a week</p>
              </Card>
              <Card variant="elevated" className="p-6 text-center">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-1">Family Care</h3>
                <p className="text-sm text-muted-foreground">All ages welcome</p>
              </Card>
              <Card variant="elevated" className="p-6 text-center mt-8">
                <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-1">Safe & Clean</h3>
                <p className="text-sm text-muted-foreground">Strict protocols</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-muted-foreground">
              Don't just take our word for it. Here's what our patients have to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} variant="default" className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div className="font-semibold">{testimonial.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-gradient">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Book your appointment today and take the first step towards a healthier, brighter smile.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/book">
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link>
            </Button>
            <Button 
              size="xl" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <a href="https://wa.me/250787630399" target="_blank" rel="noopener noreferrer">
                <Phone className="w-5 h-5" />
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
