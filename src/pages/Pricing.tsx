
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import PricingCards from '@/components/pricing/PricingCards';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const Pricing = () => {
  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and local payment methods."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 7-day free trial for all new users with full access to features."
    },
    {
      question: "What happens if I exceed my limit?",
      answer: "You can either upgrade your plan or pay per additional page at standard rates."
    }
  ];

  return (
    <MobileLayout>
      <div className="space-y-8">
        <PricingCards />

        {/* FAQ Section */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Pricing;
