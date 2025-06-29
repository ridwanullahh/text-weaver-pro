
import React from 'react';
import PageLayout from '@/components/shared/PageLayout';

const Terms = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-white/70 mb-4">
                  By accessing and using TextWeaver Pro, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
                <p className="text-white/70 mb-4">
                  TextWeaver Pro is a professional AI-powered document translation service that provides:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Document translation with format preservation</li>
                  <li>Multi-language support</li>
                  <li>Batch processing capabilities</li>
                  <li>Quality assurance tools</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                <p className="text-white/70 mb-4">
                  Users are responsible for:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Providing accurate information during registration</li>
                  <li>Maintaining the confidentiality of their account</li>
                  <li>Using the service in compliance with applicable laws</li>
                  <li>Respecting intellectual property rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Payment Terms</h2>
                <p className="text-white/70 mb-4">
                  Payment terms include:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Wallet-based payment system</li>
                  <li>Pay-per-use pricing model</li>
                  <li>Secure payment processing via Paystack</li>
                  <li>No automatic renewals without explicit consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Privacy and Data Protection</h2>
                <p className="text-white/70 mb-4">
                  We are committed to protecting your privacy and handling your data responsibly. Please refer to our Privacy Policy for detailed information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
                <p className="text-white/70 mb-4">
                  TextWeaver Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Service Availability</h2>
                <p className="text-white/70 mb-4">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted service availability. Maintenance windows will be communicated in advance when possible.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. Modifications to Terms</h2>
                <p className="text-white/70 mb-4">
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or in-app notifications.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
                <p className="text-white/70 mb-4">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="text-white/70">
                  <p>Email: legal@textweaverpro.com</p>
                  <p>Address: [Company Address]</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
