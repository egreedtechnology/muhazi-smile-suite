import PublicLayout from "@/components/layout/PublicLayout";
import SEOHead from "@/components/seo/SEOHead";

const TermsOfService = () => {
  return (
    <PublicLayout>
      <SEOHead
        title="Terms of Service"
        description="Terms of Service for Muhazi Dental Clinic. Read our terms and conditions for using our dental care services and website."
        canonical="/terms"
      />

      {/* Hero */}
      <section className="bg-muted py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our services or website.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: February 23, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl prose prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the Muhazi Dental Clinic website and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.</p>

          <h2>2. Services</h2>
          <p>Muhazi Dental Clinic provides dental care services including but not limited to:</p>
          <ul>
            <li>General dentistry (checkups, cleanings, fillings)</li>
            <li>Cosmetic dentistry (teeth whitening, veneers)</li>
            <li>Restorative dentistry (root canals, crowns, bridges)</li>
            <li>Dental implants and prosthetics</li>
            <li>Pediatric dental care</li>
            <li>Emergency dental services</li>
          </ul>
          <p>All services are provided by licensed dental professionals in accordance with Rwandan healthcare regulations.</p>

          <h2>3. Appointments</h2>
          <ul>
            <li><strong>Booking:</strong> Appointments can be booked through our website, by phone, or via WhatsApp. Online bookings are subject to confirmation by our staff.</li>
            <li><strong>Cancellations:</strong> We request at least 24 hours' notice for cancellations or rescheduling. Repeated no-shows may result in restricted booking privileges.</li>
            <li><strong>Emergencies:</strong> Walk-in emergency patients are accommodated based on availability and severity of the condition.</li>
            <li><strong>Wait Times:</strong> While we strive to maintain our schedule, delays may occur due to emergency cases or complex procedures.</li>
          </ul>

          <h2>4. Patient Responsibilities</h2>
          <p>As a patient, you agree to:</p>
          <ul>
            <li>Provide accurate and complete personal and medical information</li>
            <li>Inform us of any changes to your health status or medications</li>
            <li>Follow post-treatment instructions provided by our dental team</li>
            <li>Arrive on time for scheduled appointments</li>
            <li>Treat our staff and other patients with respect</li>
            <li>Make payments for services in a timely manner</li>
          </ul>

          <h2>5. Payment Terms</h2>
          <ul>
            <li>Payment is due at the time of service unless alternative arrangements have been made.</li>
            <li>We accept cash, mobile money (MTN MoMo, Airtel Money), and bank transfers.</li>
            <li>Prices for services are available upon request and may be updated periodically.</li>
            <li>A treatment plan with cost estimates will be provided before any major procedure.</li>
            <li>Outstanding balances may accrue additional administrative fees.</li>
          </ul>

          <h2>6. Consent for Treatment</h2>
          <p>By booking an appointment or receiving treatment, you consent to the dental procedures recommended by our professionals. For significant procedures, written informed consent will be obtained. For patients under 18, parental or guardian consent is required.</p>

          <h2>7. Website Use</h2>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Use the website for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems or data</li>
            <li>Submit false or misleading information through forms</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Copy, reproduce, or distribute website content without permission</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, and design — is the property of Muhazi Dental Clinic and is protected by copyright laws. The website was designed and developed by <a href="https://egreedtech.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">eGreed Technology</a>. Unauthorized use or reproduction is prohibited.</p>

          <h2>9. Limitation of Liability</h2>
          <p>Muhazi Dental Clinic strives to provide the highest quality dental care. However:</p>
          <ul>
            <li>We do not guarantee specific treatment outcomes, as results vary by individual.</li>
            <li>We are not liable for complications arising from failure to follow post-treatment instructions.</li>
            <li>Our website is provided "as is" without warranties of any kind regarding availability or accuracy of information.</li>
          </ul>

          <h2>10. Medical Disclaimer</h2>
          <p>Information on this website is for general informational purposes only and does not constitute medical advice. Always consult with a qualified dental professional for diagnosis and treatment recommendations specific to your condition.</p>

          <h2>11. Governing Law</h2>
          <p>These Terms of Service are governed by and construed in accordance with the laws of the Republic of Rwanda. Any disputes arising from these terms shall be resolved through the appropriate courts in Rwanda.</p>

          <h2>12. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the new terms.</p>

          <h2>13. Contact Us</h2>
          <p>If you have questions about these Terms of Service, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> muhazidentalclinic@gmail.com</li>
            <li><strong>Phone:</strong> +250 787 630 399</li>
            <li><strong>Address:</strong> 2nd Floor, Above MTN Branch, Rwamagana, Rwanda</li>
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
};

export default TermsOfService;
