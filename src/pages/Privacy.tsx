
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              TextWeaver Pro
            </Link>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center mb-4">
                Privacy Policy
              </CardTitle>
              <p className="text-white/70 text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-white/80">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                      <p>We collect information you provide directly to us, such as:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Name and email address when you create an account</li>
                        <li>Payment information when you make purchases</li>
                        <li>Communications you send to us</li>
                        <li>Documents you upload for translation</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Usage Information</h3>
                      <p>We automatically collect information about how you use our service:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Log data including IP address, browser type, and pages visited</li>
                        <li>Device information and operating system</li>
                        <li>Usage patterns and feature interactions</li>
                        <li>Translation history and preferences</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Provide, maintain, and improve our translation services</li>
                    <li>Process translations and deliver results</li>
                    <li>Handle billing and payment processing</li>
                    <li>Communicate with you about your account and our services</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Analyze usage patterns to improve our service</li>
                    <li>Detect and prevent fraud and abuse</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
                  <div className="space-y-4">
                    <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Service Providers</h3>
                      <p>We may share information with third-party service providers who help us operate our business, such as:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Payment processors for billing</li>
                        <li>Cloud storage providers for data hosting</li>
                        <li>Analytics providers for usage insights</li>
                        <li>Customer support tools</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Legal Requirements</h3>
                      <p>We may disclose information if required by law or to:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Comply with legal process or government requests</li>
                        <li>Protect our rights and property</li>
                        <li>Ensure user safety and service security</li>
                        <li>Investigate potential violations of our terms</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                  <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Secure data centers with physical safeguards</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                  <p className="mt-4">
                    However, no method of transmission over the Internet or electronic storage is 100% secure. 
                    While we strive to protect your personal information, we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Document Handling</h2>
                  <div className="space-y-4">
                    <p>Special considerations for documents you upload for translation:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Documents are processed securely and temporarily stored during translation</li>
                      <li>Original documents are automatically deleted after processing</li>
                      <li>Translation results are stored in your account for future access</li>
                      <li>You can delete translation history at any time</li>
                      <li>We do not use your documents to train our AI models without consent</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
                  <p>You have the following rights regarding your personal information:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Access:</strong> Request copies of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Obtain your data in a machine-readable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at privacy@textweaverpro.com
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
                  <p>We retain your information for as long as necessary to:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our services</li>
                  </ul>
                  <p className="mt-4">
                    When we no longer need your information, we securely delete or anonymize it.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. International Transfers</h2>
                  <p>
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your information in accordance 
                    with applicable data protection laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                  <p>
                    Our service is not intended for children under 13 years of age. We do not knowingly 
                    collect personal information from children under 13. If we become aware that we have 
                    collected personal information from a child under 13, we will take steps to delete such information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Privacy Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material 
                    changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                    You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 mt-4">
                    <p><strong>Email:</strong> privacy@textweaverpro.com</p>
                    <p><strong>Support:</strong> support@textweaverpro.com</p>
                    <p><strong>Address:</strong> TextWeaver Pro, Lagos, Nigeria</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
