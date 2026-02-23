import PublicLayout from "@/components/layout/PublicLayout";
import SEOHead from "@/components/seo/SEOHead";

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      <SEOHead
        title="Privacy Policy"
        description="Privacy Policy for Muhazi Dental Clinic. Learn how we collect, use, and protect your personal and health information."
        canonical="/privacy"
      />

      {/* Hero */}
      <section className="bg-muted py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how Muhazi Dental Clinic collects, uses, and safeguards your information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">Last updated: February 23, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-4xl prose prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">

          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information when you use our services:</p>
          <ul>
            <li><strong>Personal Information:</strong> Full name, phone number, email address, date of birth, gender, and physical address provided during registration or appointment booking.</li>
            <li><strong>Health Information:</strong> Medical history, dental records, treatment notes, diagnoses, and prescribed medications as part of your dental care.</li>
            <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and interaction data collected automatically when you use our website.</li>
            <li><strong>Communication Data:</strong> Messages, inquiries, and feedback submitted through our contact forms.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To provide, manage, and improve our dental care services</li>
            <li>To schedule and manage your appointments</li>
            <li>To communicate with you about your treatments, reminders, and follow-ups</li>
            <li>To process payments and generate invoices</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To comply with legal and regulatory obligations</li>
            <li>To improve our website and user experience</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Healthcare Providers:</strong> With referring dentists or specialists involved in your care, with your consent.</li>
            <li><strong>Service Providers:</strong> With trusted third-party services that assist in operating our website and business (e.g., hosting, email services), bound by confidentiality agreements.</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal and health information, including:</p>
          <ul>
            <li>Encrypted data transmission (SSL/TLS)</li>
            <li>Secure database storage with access controls</li>
            <li>Regular security audits and updates</li>
            <li>Staff training on data privacy and confidentiality</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>We retain your personal and health information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Medical records are retained in accordance with Rwanda's healthcare regulations.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete information</li>
            <li>Request deletion of your personal data (subject to legal retention requirements)</li>
            <li>Withdraw consent for non-essential data processing</li>
            <li>Lodge a complaint with the relevant data protection authority</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>Our website may use cookies to enhance your browsing experience. Cookies are small files stored on your device that help us understand how you use our site. You can control cookie settings through your browser preferences.</p>

          <h2>8. Children's Privacy</h2>
          <p>We provide dental services to patients of all ages. For patients under 18, we require parental or guardian consent for data collection and treatment. Parents and guardians may access, modify, or request deletion of their child's information.</p>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.</p>

          <h2>10. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
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

export default PrivacyPolicy;
