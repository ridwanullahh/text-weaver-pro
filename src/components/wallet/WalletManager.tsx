
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { paystackService } from '@/services/paystackService';
import { Wallet, Plus, CreditCard, History, AlertCircle } from 'lucide-react';

const WalletManager = () => {
  const { user, updateWallet } = useAuth();
  const { toast } = useToast();
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFundWallet = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to fund your wallet.",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      // Check if Paystack is configured
      if (!paystackService.isConfigured()) {
        toast({
          title: "Payment Not Configured",
          description: "Payment system is not properly configured. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Initialize Paystack payment
      const paymentData = {
        amount: amount,
        email: user.email,
        currency: 'NGN',
        callback_url: `${window.location.origin}/dashboard?payment=success`,
        metadata: {
          userId: user.id,
          purpose: 'wallet_funding',
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.id
            }
          ]
        }
      };

      const response = await paystackService.initializePayment(paymentData);
      
      if (response.status && response.data?.authorization_url) {
        // Open payment in new tab
        window.open(response.data.authorization_url, '_blank');
        
        toast({
          title: "Payment Initialized",
          description: "Complete your payment in the new tab to fund your wallet.",
        });

        // Start polling for payment verification
        const reference = response.data.reference;
        startPaymentVerification(reference, amount);
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentVerification = async (reference: string, amount: number) => {
    // Poll for payment verification every 5 seconds for up to 5 minutes
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const pollPayment = async () => {
      try {
        const verification = await paystackService.verifyPayment(reference);
        
        if (verification.status && verification.data?.status === 'success') {
          // Payment successful - update wallet
          await updateWallet(amount);
          setFundAmount('');
          
          toast({
            title: "Payment Successful! 💰",
            description: `₦${amount.toFixed(2)} has been added to your wallet.`,
          });
          return;
        } else if (verification.data?.status === 'failed') {
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        // Continue polling if payment is still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollPayment, 5000);
        } else {
          toast({
            title: "Payment Verification Timeout",
            description: "Unable to verify payment status. If you completed the payment, it may take a few minutes to reflect.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollPayment, 5000);
        }
      }
    };

    setTimeout(pollPayment, 5000); // Start polling after 5 seconds
  };

  if (!user) return null;

  const currency = '₦'; // Nigerian Naira for Paystack
  const pagePrice = parseInt(import.meta.env.VITE_NIGERIA_PAGE_PRICE || '10');
  const textPrice = parseInt(import.meta.env.VITE_NIGERIA_TEXT_PRICE || '5');

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white mb-2">
              {currency}{user.walletBalance.toFixed(2)}
            </div>
            <p className="text-white/60 text-sm">Available balance</p>
          </div>

          {!paystackService.isConfigured() && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">Payment system not configured. Contact support to enable funding.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount to add (₦)"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                step="1"
                min="100"
                disabled={!paystackService.isConfigured()}
              />
              <Button
                onClick={handleFundWallet}
                disabled={isLoading || !fundAmount || !paystackService.isConfigured()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shrink-0"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" /> Fund
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2500].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setFundAmount(amount.toString())}
                  className="border-white/20 text-white hover:bg-white/10"
                  disabled={!paystackService.isConfigured()}
                >
                  ₦{amount}
                </Button>
              ))}
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pricing Information
              </h4>
              <div className="text-xs text-white/60 space-y-1">
                <p>• Book pages: {currency}{pagePrice} each</p>
                <p>• Text translations: {currency}{textPrice} each</p>
                <p>• 3 free text translations daily</p>
                <p>• Premium features and priority support</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletManager;
