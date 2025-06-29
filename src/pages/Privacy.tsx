
import React from 'react';
import PageLayout from '@/components/shared/PageLayout';

const Privacy = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p className="text-white/70 mb-4">
                  We collect information you provide directly to us, such as:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Account information (name, email, password)</li>
                  <li>Documents you upload for translation</li>
                  <li>Payment and billing information</li>
                  <li>Communications with our support team</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-white/70 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Provide and maintain our translation services</li>
                  <li>Process your translations and deliver results</li>
                  <li>Handle billing and payment processing</li>
                  <li>Communicate with you about your account</li>
                  <li>Improve our services and user experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                <p className="text-white/70 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data storage and backup procedures</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Document Handling</h2>
                <p className="text-white/70 mb-4">
                  For documents you upload:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Documents are processed securely and deleted after translation</li>
                  <li>We do not store document content longer than necessary</li>
                  <li>Access to your documents is limited to authorized personnel</li>
                  <li>We do not use your documents to train our AI models without consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-white/70 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With trusted service providers under strict confidentiality agreements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
                <p className="text-white/70 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
                <p className="text-white/70 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-white/70 mb-4 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
                <p className="text-white/70 mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
                <p className="text-white/70 mb-4">
                  We may update this privacy policy from time to time. We will notify you of any material changes by email or through our service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
                <p className="text-white/70 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="text-white/70">
                  <p>Email: privacy@textweaverpro.com</p>
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

export default Privacy;
