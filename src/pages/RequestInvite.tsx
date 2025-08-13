
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sdk } from '@/services/sdkService';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/shared/PageLayout';

const RequestInvite = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    useCase: '',
    expectedVolume: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await sdk.insert('invite_requests', {
        ...formData,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageLayout showFooter={false}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-white mb-4">Request Submitted!</h2>
                <p className="text-white/70 mb-6">
                  Thank you for your interest. We'll review your request and send you an invitation code within 24-48 hours.
                </p>
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    Back to Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter={false}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/login" className="text-white/60 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <CardTitle className="text-2xl font-bold text-white">Request Invitation</CardTitle>
              </div>
              <p className="text-white/70">Tell us about your translation needs</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
                <Input
                  placeholder="Company/Organization"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <textarea
                  placeholder="Describe your translation use case"
                  value={formData.useCase}
                  onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
                  className="w-full h-24 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 resize-none"
                  required
                />
                <select
                  value={formData.expectedVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedVolume: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white"
                  required
                >
                  <option value="">Expected monthly volume</option>
                  <option value="1-10">1-10 documents</option>
                  <option value="11-50">11-50 documents</option>
                  <option value="51-200">51-200 documents</option>
                  <option value="200+">200+ documents</option>
                </select>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : (
                    <>
                      Submit Request <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default RequestInvite;
