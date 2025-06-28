
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
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
                Terms of Service
              </CardTitle>
              <p className="text-white/70 text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-white/80">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using TextWeaver Pro ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                  <p>
                    TextWeaver Pro is a document translation platform that uses artificial intelligence and traditional translation methods 
                    to convert documents between different languages. The service supports various file formats including PDF, DOCX, TXT, and others.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                  <div className="space-y-3">
                    <p>
                      To access certain features of the Service, you must register for an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide accurate, current, and complete information during registration</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
                      <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
                  <div className="space-y-3">
                    <p>You agree not to use the Service to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Upload, post, or transmit any content that is unlawful, harmful, or violates any applicable laws</li>
                      <li>Infringe upon the intellectual property rights of others</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with or disrupt the Service or servers</li>
                      <li>Use the Service for any commercial purpose without our express written consent</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Payment and Billing</h2>
                  <div className="space-y-3">
                    <p>
                      For paid services, you agree to pay all charges incurred by your account. Payment terms include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                      <li>Pay-as-you-go charges are billed after service usage</li>
                      <li>All fees are non-refundable except as required by law</li>
                      <li>We reserve the right to change our pricing with 30 days notice</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
                  <p>
                    The Service and its original content, features, and functionality are owned by TextWeaver Pro and are protected by 
                    international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy Policy</h2>
                  <p>
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information 
                    when you use our Service. By using our Service, you agree to the collection and use of information in accordance 
                    with our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your personal information. However, no method of transmission 
                    over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, 
                    we cannot guarantee its absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                  <p>
                    In no event shall TextWeaver Pro, its directors, employees, partners, agents, suppliers, or affiliates be liable 
                    for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
                    data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
                  <p>
                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                    under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 
                    30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 mt-4">
                    <p><strong>Email:</strong> support@textweaverpro.com</p>
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

export default Terms;
