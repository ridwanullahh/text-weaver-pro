
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { paystackService } from '@/services/paystackService';
import { Wallet, Plus, CreditCard, History } from 'lucide-react';

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
      // Check if Paystack is enabled
      const paystackEnabled = import.meta.env.VITE_ENABLE_PAYSTACK === 'true';
      
      if (paystackEnabled && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
        // Initialize Paystack payment
        const paymentData = {
          amount: amount,
          email: user.email,
          currency: 'NGN',
          metadata: {
            userId: user.id,
            purpose: 'wallet_funding'
          }
        };

        const response = await paystackService.initializePayment(paymentData);
        
        if (response.status) {
          // Open payment in new tab
          window.open(response.data.authorization_url, '_blank');
          
          toast({
            title: "Payment Initialized",
            description: "Complete your payment in the new tab to fund your wallet.",
          });
        } else {
          throw new Error(response.message);
        }
      } else {
        // Demo mode - simulate successful payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        await updateWallet(amount);
        setFundAmount('');
        
        toast({
          title: "Wallet Funded Successfully! 💰",
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
        });
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

  if (!user) return null;

  const isNigeria = user.email.includes('.ng') || user.email.includes('nigeria');
  const currency = isNigeria ? '₦' : '$';
  const pagePrice = isNigeria ? 
    parseInt(import.meta.env.VITE_NIGERIA_PAGE_PRICE || '10') : 
    parseFloat(import.meta.env.VITE_INTERNATIONAL_PAGE_PRICE || '0.10');
  const textPrice = isNigeria ? 
    parseInt(import.meta.env.VITE_NIGERIA_TEXT_PRICE || '5') : 
    parseFloat(import.meta.env.VITE_INTERNATIONAL_TEXT_PRICE || '0.05');

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

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount to add"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                step="0.01"
                min="1"
              />
              <Button
                onClick={handleFundWallet}
                disabled={isLoading || !fundAmount}
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
              {isNigeria ? 
                [500, 1000, 2500].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFundAmount(amount.toString())}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    ₦{amount}
                  </Button>
                )) :
                [5, 10, 25].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFundAmount(amount.toString())}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    ${amount}
                  </Button>
                ))
              }
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
